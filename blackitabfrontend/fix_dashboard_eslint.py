import re

with open('src/pages/admin/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix getToken declaration - move it up before useEffect
get_token_pattern = re.compile(r"  useEffect\(\(\) => \{\n    const adminData = localStorage\.getItem\('admin'\);\n    const adminToken = localStorage\.getItem\('adminToken'\);", re.DOTALL)
content = get_token_pattern.sub(r"  const getToken = () => localStorage.getItem('adminToken');\n  const headers = () => ({ Authorization: `Bearer ${getToken()}` });\n\n  useEffect(() => {\n    const adminData = localStorage.getItem('admin');\n    const adminToken = localStorage.getItem('adminToken');", content)

# 2. Fix the fetch functions placement - move them before useEffect 
# (This requires a bit of reorganization - easier to just wrap fetch calls in useCallback or define them earlier)
# Wait, actually moving them ALL earlier is complex via regex.
