const mongoose = require("mongoose");
const Batch = require("../models/Batch");
const User = require("../models/User");
const Attempt = require("../models/Attempt");
const Attendance = require("../models/Attendance");
const Institute = require("../models/Institute");

function mapTeacher(teacher) {
  return {
    name: teacher.name,
    email: teacher.email,
    departments: Array.isArray(teacher.departments) ? teacher.departments.slice(0, 3) : [],
    specialization: teacher.specialization || "",
  };
}

function mapStudentSummary(student) {
  return {
    name: student.name,
    accuracy: student.accuracy,
    attempts: student.attempts,
    attendance: student.attendancePercentage,
    absentCount: student.absentCount,
  };
}

async function getTeacherAnalyticsContext(user) {
  const role = user?.role;
  const userId = user?._id;
  const instituteId = user?.instituteId;
  const hodDepartments = Array.isArray(user?.departments) ? user.departments.filter(Boolean) : [];

  if ((role === "hod" || role === "institute") && !instituteId) {
    return {
      scope: role,
      institute: null,
      teacherDirectory: { scope: role, total: 0, teachers: [] },
      totalBatches: 0,
      totalStudents: 0,
      staffCounts: {},
      aggregateClassPerformance: { avgAccuracy: 0, totalAttempts: 0, studentsWithAttempts: 0 },
      weakestStudents: [],
      topStudents: [],
      attendanceRiskStudents: [],
      batchSummary: [],
    };
  }

  const batchQuery = role === "teacher" ? { teacherIds: userId } : { instituteId };
  const teacherDirectoryQuery = role === "hod"
    ? {
      instituteId: new mongoose.Types.ObjectId(instituteId),
      role: "teacher",
      ...(hodDepartments.length ? { departments: { $in: hodDepartments } } : {}),
    }
    : {
      instituteId: new mongoose.Types.ObjectId(instituteId),
      role: "teacher",
    };

  const batches = await Batch.find(batchQuery)
    .select("_id name section studentIds")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const [institute, staffCountsRaw, teacherDirectoryRaw] = await Promise.all([
    instituteId
      ? Institute.findById(instituteId).select("name instituteCode subscriptionPlan departments").lean()
      : null,
    instituteId
      ? User.aggregate([
        { $match: { instituteId: new mongoose.Types.ObjectId(instituteId), role: { $in: ["teacher", "hod", "institute"] } } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ])
      : [],
    instituteId
      ? User.find(teacherDirectoryQuery)
        .select("name email departments specialization")
        .sort({ name: 1 })
        .limit(60)
        .lean()
      : [],
  ]);

  const staffCounts = staffCountsRaw.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const base = {
    scope: role,
    institute: institute
      ? {
        name: institute.name,
        code: institute.instituteCode,
        plan: institute.subscriptionPlan,
        departments: Array.isArray(institute.departments) ? institute.departments.slice(0, 8) : [],
        departmentCount: Array.isArray(institute.departments) ? institute.departments.length : 0,
      }
      : null,
    teacherDirectory: {
      scope: role === "hod" ? "hod_departments" : "institute",
      total: teacherDirectoryRaw.length,
      teachers: teacherDirectoryRaw.map(mapTeacher).slice(0, 40),
    },
    totalBatches: batches.length,
    totalStudents: 0,
    staffCounts,
    aggregateClassPerformance: { avgAccuracy: 0, totalAttempts: 0, studentsWithAttempts: 0 },
    weakestStudents: [],
    topStudents: [],
    attendanceRiskStudents: [],
    batchSummary: batches.slice(0, 10).map((batch) => ({
      batch: `${batch.name || "Batch"}${batch.section ? ` (${batch.section})` : ""}`,
      students: Array.isArray(batch.studentIds) ? batch.studentIds.length : 0,
    })),
  };

  if (!batches.length) {
    return base;
  }

  const batchIds = batches.map((batch) => batch._id);
  const studentIds = Array.from(
    new Set(
      batches
        .flatMap((batch) => (Array.isArray(batch.studentIds) ? batch.studentIds : []))
        .map((id) => id.toString())
    )
  ).slice(0, 400);

  if (!studentIds.length) {
    return base;
  }

  const studentObjectIds = studentIds.map((id) => new mongoose.Types.ObjectId(id));

  const [students, attemptStats, attendanceStats] = await Promise.all([
    User.find({ _id: { $in: studentObjectIds } }).select("_id name").lean(),
    Attempt.aggregate([
      { $match: { userId: { $in: studentObjectIds } } },
      {
        $group: {
          _id: "$userId",
          totalAttempts: { $sum: 1 },
          correctAttempts: { $sum: { $cond: ["$isCorrect", 1, 0] } },
        },
      },
    ]),
    Attendance.aggregate([
      { $match: { classId: { $in: batchIds } } },
      { $unwind: "$records" },
      { $match: { "records.studentId": { $in: studentObjectIds } } },
      {
        $group: {
          _id: "$records.studentId",
          totalSessions: { $sum: 1 },
          presentCount: { $sum: { $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0] } },
          absentCount: { $sum: { $cond: [{ $eq: ["$records.status", "Absent"] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const studentMap = new Map(students.map((s) => [s._id.toString(), s]));
  const attemptMap = new Map(attemptStats.map((s) => [s._id.toString(), s]));
  const attendanceMap = new Map(attendanceStats.map((s) => [s._id.toString(), s]));

  const studentMetrics = studentIds
    .map((studentId) => {
      const profile = studentMap.get(studentId);
      if (!profile) return null;

      const attempts = attemptMap.get(studentId) || { totalAttempts: 0, correctAttempts: 0 };
      const attendance = attendanceMap.get(studentId) || { totalSessions: 0, presentCount: 0, absentCount: 0 };

      const accuracy = attempts.totalAttempts > 0
        ? Number(((attempts.correctAttempts / attempts.totalAttempts) * 100).toFixed(1))
        : 0;

      const attendancePercentage = attendance.totalSessions > 0
        ? Number(((attendance.presentCount / attendance.totalSessions) * 100).toFixed(1))
        : null;

      return {
        name: profile.name,
        attempts: attempts.totalAttempts,
        accuracy,
        attendancePercentage,
        absentCount: attendance.absentCount || 0,
      };
    })
    .filter(Boolean);

  const byAccuracyAsc = [...studentMetrics].sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts);
  const byAccuracyDesc = [...studentMetrics].sort((a, b) => b.accuracy - a.accuracy || b.attempts - a.attempts);
  const byAttendanceAsc = [...studentMetrics]
    .filter((s) => s.attendancePercentage !== null)
    .sort((a, b) => a.attendancePercentage - b.attendancePercentage || b.absentCount - a.absentCount);

  const totalAttempts = studentMetrics.reduce((sum, student) => sum + (student.attempts || 0), 0);
  const studentsWithAttempts = studentMetrics.filter((student) => (student.attempts || 0) > 0);
  const avgAccuracy = studentsWithAttempts.length > 0
    ? Number((studentsWithAttempts.reduce((sum, student) => sum + student.accuracy, 0) / studentsWithAttempts.length).toFixed(1))
    : 0;

  return {
    ...base,
    totalStudents: studentMetrics.length,
    aggregateClassPerformance: {
      avgAccuracy,
      totalAttempts,
      studentsWithAttempts: studentsWithAttempts.length,
    },
    weakestStudents: byAccuracyAsc.slice(0, 5).map(mapStudentSummary),
    topStudents: byAccuracyDesc.slice(0, 5).map(mapStudentSummary),
    attendanceRiskStudents: byAttendanceAsc.slice(0, 5).map(mapStudentSummary),
  };
}

module.exports = {
  getTeacherAnalyticsContext,
};
