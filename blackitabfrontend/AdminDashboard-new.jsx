<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>RANKLEN | Ethereal Command Center</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "on-secondary-container": "#ddcdff",
              "secondary-container": "#7000ff",
              "on-tertiary": "#490080",
              "on-secondary": "#3c0090",
              "secondary": "#d1bcff",
              "on-primary-container": "#f1f2ff",
              "outline-variant": "#424656",
              "surface-variant": "#2d3449",
              "on-error": "#690005",
              "surface-container-highest": "#2d3449",
              "inverse-surface": "#dae2fd",
              "secondary-fixed": "#e9ddff",
              "on-primary-fixed-variant": "#003ea8",
              "on-tertiary-fixed": "#2c0051",
              "on-primary": "#002a78",
              "surface": "#0b1326",
              "on-secondary-fixed-variant": "#5700c9",
              "surface-container-lowest": "#060e20",
              "on-primary-fixed": "#00174b",
              "error": "#ffb4ab",
              "tertiary-fixed": "#f0dbff",
              "surface-dim": "#0b1326",
              "primary-fixed-dim": "#b4c5ff",
              "primary-container": "#0061ff",
              "on-tertiary-fixed-variant": "#6900b3",
              "tertiary-container": "#9541e4",
              "outline": "#8c90a2",
              "surface-container": "#171f33",
              "surface-container-high": "#222a3d",
              "tertiary": "#ddb7ff",
              "primary": "#b4c5ff",
              "inverse-on-surface": "#283044",
              "tertiary-fixed-dim": "#ddb7ff",
              "inverse-primary": "#0052dc",
              "surface-tint": "#b4c5ff",
              "on-background": "#dae2fd",
              "on-surface": "#dae2fd",
              "secondary-fixed-dim": "#d1bcff",
              "on-surface-variant": "#c2c6d9",
              "on-error-container": "#ffdad6",
              "background": "#0b1326",
              "on-secondary-fixed": "#23005b",
              "surface-container-low": "#131b2e",
              "error-container": "#93000a",
              "primary-fixed": "#dbe1ff",
              "surface-bright": "#31394d",
              "on-tertiary-container": "#fbefff"
            },
            fontFamily: {
              "headline": ["Inter"],
              "body": ["Inter"],
              "label": ["Inter"]
            },
            borderRadius: {"DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "9999px"},
          },
        },
      }
    </script>
<style>
        body { font-family: 'Inter', sans-serif; background-color: #0b1326; color: #dae2fd; }
        .glass-card {
            background: rgba(34, 42, 61, 0.4);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(66, 70, 86, 0.2);
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .active-pill {
            box-shadow: 0 0 20px rgba(0, 97, 255, 0.3);
        }
    </style>
</head>
<body class="flex min-h-screen">
<!-- SideNavBar -->
<aside class="fixed left-0 h-full w-64 border-r border-[#424656]/20 bg-[#131b2e] flex flex-col gap-2 p-6 z-[60]">
<div class="mb-10 px-2">
<div class="flex items-center gap-3 mb-6">
<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-[0_0_15px_rgba(0,97,255,0.4)]">
<span class="material-symbols-outlined text-white text-2xl" style="font-variation-settings: 'FILL' 1;">shield</span>
</div>
<div>
<h1 class="text-xl font-bold text-[#b4c5ff] tracking-tighter">RANKLEN</h1>
<p class="text-[10px] text-on-surface-variant tracking-[0.1em] uppercase font-bold opacity-60">Command Center</p>
</div>
</div>
<div class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high/50 border border-outline-variant/10">
<img alt="Admin user profile" class="w-8 h-8 rounded-lg bg-surface-container-highest" data-alt="Professional avatar of a systems administrator" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5TqwbUo4aYIc9ZvYzZ6S-vqjcf08GiwXildhVQYflbcXMDIQdxaDn0vo0UtxUHs8Rw-Xprik3CKwXwddXjSmXApOGwBEOpRC_RW4sBoCB40lGD2d24lvnr9_eCnFI6BR_TAfbrQsf-Ql7tkSkuntU7kbJ3GGH8QRh8JRGR0KmIIDpQG8iDEoChYr9fnG1ZDLbp4SKjnABvxnJjLcmxr-7w_ar8TEP2nDBv1pvjzEBJZXRCrU13oCY63M_HdiAGLLbm9SCWE0Prb0Q"/>
<div class="overflow-hidden">
<p class="text-xs font-bold text-on-surface truncate">Elite Administrator</p>
<p class="text-[10px] text-on-surface-variant truncate">System Active</p>
</div>
</div>
</div>
<nav class="flex flex-col gap-1">
<!-- Overview - ACTIVE -->
<a class="bg-[#0061ff] text-white rounded-lg shadow-[0_0_15px_rgba(0,97,255,0.4)] flex items-center gap-3 px-4 py-3 translate-x-1 transition-transform group" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span class="font-['Inter'] label-md tracking-[0.05rem] uppercase font-semibold">Overview</span>
</a>
<!-- Users -->
<a class="text-[#c2c6d9] hover:text-white hover:bg-[#222a3d] transition-colors duration-200 flex items-center gap-3 px-4 py-3 rounded-lg group" href="#">
<span class="material-symbols-outlined" data-icon="group">group</span>
<span class="font-['Inter'] label-md tracking-[0.05rem] uppercase font-semibold text-xs">Users</span>
</a>
<!-- Institutes -->
<a class="text-[#c2c6d9] hover:text-white hover:bg-[#222a3d] transition-colors duration-200 flex items-center gap-3 px-4 py-3 rounded-lg group" href="#">
<span class="material-symbols-outlined" data-icon="account_balance">account_balance</span>
<span class="font-['Inter'] label-md tracking-[0.05rem] uppercase font-semibold text-xs">Institutes</span>
</a>
<!-- Questions -->
<a class="text-[#c2c6d9] hover:text-white hover:bg-[#222a3d] transition-colors duration-200 flex items-center gap-3 px-4 py-3 rounded-lg group" href="#">
<span class="material-symbols-outlined" data-icon="quiz">quiz</span>
<span class="font-['Inter'] label-md tracking-[0.05rem] uppercase font-semibold text-xs">Questions</span>
</a>
<!-- Posts -->
<a class="text-[#c2c6d9] hover:text-white hover:bg-[#222a3d] transition-colors duration-200 flex items-center gap-3 px-4 py-3 rounded-lg group" href="#">
<span class="material-symbols-outlined" data-icon="article">article</span>
<span class="font-['Inter'] label-md tracking-[0.05rem] uppercase font-semibold text-xs">Posts</span>
</a>
<!-- Contests -->
<a class="text-[#c2c6d9] hover:text-white hover:bg-[#222a3d] transition-colors duration-200 flex items-center gap-3 px-4 py-3 rounded-lg group" href="#">
<span class="material-symbols-outlined" data-icon="emoji_events">emoji_events</span>
<span class="font-['Inter'] label-md tracking-[0.05rem] uppercase font-semibold text-xs">Contests</span>
</a>
<!-- Analytics -->
<a class="text-[#c2c6d9] hover:text-white hover:bg-[#222a3d] transition-colors duration-200 flex items-center gap-3 px-4 py-3 rounded-lg group" href="#">
<span class="material-symbols-outlined" data-icon="analytics">analytics</span>
<span class="font-['Inter'] label-md tracking-[0.05rem] uppercase font-semibold text-xs">Analytics</span>
</a>
</nav>
<div class="mt-auto pt-6 border-t border-outline-variant/10">
<button class="w-full flex items-center gap-3 px-4 py-3 text-error rounded-lg hover:bg-error/10 transition-colors">
<span class="material-symbols-outlined">logout</span>
<span class="font-semibold text-xs uppercase tracking-wider">Logout</span>
</button>
</div>
</aside>
<!-- Main Canvas -->
<main class="flex-1 ml-64 min-h-screen flex flex-col relative overflow-x-hidden">
<!-- TopAppBar -->
<header class="bg-[#0b1326]/60 backdrop-blur-xl border-b border-[#424656]/20 sticky top-0 z-50 flex justify-between items-center px-8 h-20 w-full shadow-[0_32px_32px_-4px_rgba(255,255,255,0.06)]">
<div class="flex items-center gap-6">
<div class="relative group">
<span class="absolute inset-y-0 left-3 flex items-center text-on-surface-variant">
<span class="material-symbols-outlined text-lg">search</span>
</span>
<input class="bg-surface-container-lowest border border-outline-variant/20 rounded-xl pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none" placeholder="Search system logs..." type="text"/>
</div>
</div>
<div class="flex items-center gap-4">
<button class="p-2 rounded-full hover:bg-surface-container-high transition-all relative">
<span class="material-symbols-outlined text-on-surface-variant">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface"></span>
</button>
<button class="p-2 rounded-full hover:bg-surface-container-high transition-all">
<span class="material-symbols-outlined text-on-surface-variant">settings</span>
</button>
</div>
</header>
<!-- Content Area -->
<div class="p-10 flex flex-col gap-10">
<!-- Hero Header -->
<section class="flex flex-col gap-1">
<h2 class="text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-primary via-primary-fixed-dim to-secondary bg-clip-text text-transparent">System Overview</h2>
<p class="font-['Inter'] label-md tracking-[0.05rem] text-on-surface-variant uppercase font-medium">Real-time performance metrics and entity management</p>
</section>
<!-- Stats Bento Grid -->
<section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
<!-- Total Users -->
<div class="glass-card p-6 rounded-2xl flex flex-col justify-between hover:border-primary/40 transition-all group">
<div class="flex justify-between items-start mb-4">
<div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
<span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">person</span>
</div>
<span class="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg flex items-center gap-1">
<span class="material-symbols-outlined text-xs">trending_up</span> +12%
                        </span>
</div>
<div>
<p class="text-4xl font-black text-on-surface tracking-tighter">14,282</p>
<p class="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-1">Total Users</p>
</div>
</div>
<!-- Institutes -->
<div class="glass-card p-6 rounded-2xl flex flex-col justify-between hover:border-secondary/40 transition-all group">
<div class="flex justify-between items-start mb-4">
<div class="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
<span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">account_balance</span>
</div>
<span class="text-xs font-bold text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded-lg">Stable</span>
</div>
<div>
<p class="text-4xl font-black text-on-surface tracking-tighter">124</p>
<p class="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-1">Institutes</p>
</div>
</div>
<!-- Daily Active -->
<div class="glass-card p-6 rounded-2xl flex flex-col justify-between hover:border-primary-container/40 transition-all group">
<div class="flex justify-between items-start mb-4">
<div class="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container border border-primary-container/20">
<span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">bolt</span>
</div>
<span class="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg flex items-center gap-1">
<span class="material-symbols-outlined text-xs">trending_up</span> +24%
                        </span>
</div>
<div>
<p class="text-4xl font-black text-on-surface tracking-tighter">3.8k</p>
<p class="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-1">Daily Active</p>
</div>
</div>
<!-- Questions -->
<div class="glass-card p-6 rounded-2xl flex flex-col justify-between hover:border-tertiary/40 transition-all group">
<div class="flex justify-between items-start mb-4">
<div class="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary border border-tertiary/20">
<span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">quiz</span>
</div>
<span class="text-xs font-bold text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded-lg">Total</span>
</div>
<div>
<p class="text-4xl font-black text-on-surface tracking-tighter">892</p>
<p class="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-1">Questions</p>
</div>
</div>
<!-- Posts -->
<div class="glass-card p-6 rounded-2xl flex flex-col justify-between hover:border-error/40 transition-all group">
<div class="flex justify-between items-start mb-4">
<div class="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error border border-error/20">
<span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">article</span>
</div>
<span class="text-xs font-bold text-error bg-error/10 px-2 py-1 rounded-lg flex items-center gap-1">
<span class="material-symbols-outlined text-xs">trending_down</span> -2%
                        </span>
</div>
<div>
<p class="text-4xl font-black text-on-surface tracking-tighter">2,104</p>
<p class="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-1">Posts</p>
</div>
</div>
</section>
<!-- Table Section -->
<section class="flex flex-col gap-6">
<div class="flex justify-between items-end">
<div>
<h3 class="text-2xl font-bold text-on-surface tracking-tight">User Management</h3>
<p class="text-sm text-on-surface-variant">Latest registrations and system access control</p>
</div>
<div class="flex gap-3">
<button class="px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface hover:bg-surface-container-highest transition-all text-sm font-medium">Export CSV</button>
<button class="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm font-bold">Add New User</button>
</div>
</div>
<div class="glass-card rounded-[2rem] overflow-hidden">
<table class="w-full text-left">
<thead>
<tr class="bg-surface-container-high/50">
<th class="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-black text-on-surface-variant">User Entity</th>
<th class="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-black text-on-surface-variant">Access Tier</th>
<th class="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-black text-on-surface-variant">Activity</th>
<th class="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-black text-on-surface-variant">Status</th>
<th class="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-black text-on-surface-variant text-right">Actions</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant/5">
<tr class="hover:bg-surface-container-highest/30 transition-colors group">
<td class="px-8 py-5">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 overflow-hidden">
<img alt="User 1" class="w-full h-full object-cover" data-alt="User profile avatar placeholder" src="https://lh3.googleusercontent.com/aida-public/AB6AXuConcrwgfOk3FzvayBQekQtGH8mkUDHhWgS0_kGTuqEiNdPKw4WcsUtHHKZuINmi18RlMVcO18257q1pIxCVx4DgKAbZujozxizY1pFE2nDJx9P_LXCtaAPyCj_KQL9RrqP5Y-IoM3m878O_YnHbGAPW5-6gcKnaUzvbMKFpdUSovG2wBme6IJbsQjOO5dFjmWdSpx4t-gyHlqOPTiG2JiuhubczwF1nX5WEZCdrrDJm-CO-OMFqTxt3dxT56TR2xfmpB0YCECS5VIz"/>
</div>
<div>
<p class="text-sm font-bold text-on-surface">Julianne Dehner</p>
<p class="text-xs text-on-surface-variant">julianne.d@ranklen.io</p>
</div>
</div>
</td>
<td class="px-8 py-5">
<span class="text-xs font-semibold px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">Institute Lead</span>
</td>
<td class="px-8 py-5">
<p class="text-xs font-medium text-on-surface">2 mins ago</p>
<p class="text-[10px] text-on-surface-variant">DASHBOARD_LOGIN</p>
</td>
<td class="px-8 py-5">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
<span class="text-xs font-bold text-green-400">Active</span>
</div>
</td>
<td class="px-8 py-5 text-right">
<button class="p-2 text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
<tr class="hover:bg-surface-container-highest/30 transition-colors group">
<td class="px-8 py-5">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-tertiary/20 flex items-center justify-center border border-tertiary/20 overflow-hidden">
<img alt="User 2" class="w-full h-full object-cover" data-alt="User profile avatar placeholder" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNmF5AeUJ862RsNc2rOIiixMMRFgmdy-Y9ebhOiAIhqSHHENK9WssZ0o9_D-PuO-DzmHxSX2RTpL8Cn9UR-1RnY-JiaHe_koyNC0UMJqZhMBxHRx-8G5_LI8zt2Q63AAAkD0xKLl-n_1RW5xRmkeqcoAGQ2ajklm8UAQRR7FXe2FW0a9fknH3EuqW_42KPCdh9IPr4ilULDRmF7k1Mb2CjJ630sKepYl2FTmI74h5COxkuhXZ5Cpfh4rzMMCgR-V1kHuA7JVlOA1XM"/>
</div>
<div>
<p class="text-sm font-bold text-on-surface">Ramesh Kumar</p>
<p class="text-xs text-on-surface-variant">rk.kumar@edu.in</p>
</div>
</div>
</td>
<td class="px-8 py-5">
<span class="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Standard User</span>
</td>
<td class="px-8 py-5">
<p class="text-xs font-medium text-on-surface">15 mins ago</p>
<p class="text-[10px] text-on-surface-variant">QUIZ_SUBMISSION</p>
</td>
<td class="px-8 py-5">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
<span class="text-xs font-bold text-green-400">Active</span>
</div>
</td>
<td class="px-8 py-5 text-right">
<button class="p-2 text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
<tr class="hover:bg-surface-container-highest/30 transition-colors group">
<td class="px-8 py-5">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center border border-error/20 overflow-hidden">
<img alt="User 3" class="w-full h-full object-cover" data-alt="User profile avatar placeholder" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArzEiTVkES_0ZJoe5WVvdXx3Pmz_zPx-yKTjZQtyg_69BcudwBU1yrFf8qUCr0xtfSyczuRW8qm_fvXCib5IHIOdz_HQZSr2dc0zEwbGA5Lyw8G_0Ggnz25H2sQFVV3xnlwXMZFHAoR8lmwL9VBIOxeFUPZ0Vci2dM9lh1AFYHiVBc4lbfiPUa8To3sAwr-FfZKh2aEHK_ocZKTGPhnvGg0ajkxGUnHEw9bZ-gtT1SpUGHRhc_1XWw7MuKSHXZkZN7U1n3WpGWJnyw"/>
</div>
<div>
<p class="text-sm font-bold text-on-surface">Amanda Smith</p>
<p class="text-xs text-on-surface-variant">asmith_temp@gmail.com</p>
</div>
</div>
</td>
<td class="px-8 py-5">
<span class="text-xs font-semibold px-3 py-1 rounded-full bg-outline-variant/20 text-on-surface-variant border border-outline-variant/20">Guest Account</span>
</td>
<td class="px-8 py-5">
<p class="text-xs font-medium text-on-surface">3 days ago</p>
<p class="text-[10px] text-on-surface-variant">IDLE_TIMEOUT</p>
</td>
<td class="px-8 py-5">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-on-surface-variant/40"></div>
<span class="text-xs font-bold text-on-surface-variant">Inactive</span>
</div>
</td>
<td class="px-8 py-5 text-right">
<button class="p-2 text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
</section>
</div>
<!-- Footer -->
<footer class="w-full py-8 mt-auto flex flex-col items-center justify-center gap-4">
<div class="flex gap-6">
<a class="font-['Inter'] label-sm tracking-[0.05rem] text-[#c2c6d9]/60 hover:text-[#b4c5ff] transition-opacity opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
<a class="font-['Inter'] label-sm tracking-[0.05rem] text-[#c2c6d9]/60 hover:text-[#b4c5ff] transition-opacity opacity-80 hover:opacity-100" href="#">System Status</a>
<a class="font-['Inter'] label-sm tracking-[0.05rem] text-[#c2c6d9]/60 hover:text-[#b4c5ff] transition-opacity opacity-80 hover:opacity-100" href="#">API Docs</a>
</div>
<p class="font-['Inter'] label-sm tracking-[0.05rem] text-center text-[#c2c6d9] opacity-80">© 2024 RANKLEN Ethereal Command. All rights reserved.</p>
</footer>
</main>
</body></html>