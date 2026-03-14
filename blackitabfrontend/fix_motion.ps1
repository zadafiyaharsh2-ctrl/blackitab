$files = @(
  'src/components/admin/modals/AdminTeacherFeedbackModal.jsx',
  'src/components/admin/tabs/AnalyticsTab.jsx',
  'src/components/admin/tabs/ContestsTab.jsx',
  'src/components/admin/tabs/InstitutesTab.jsx',
  'src/components/admin/tabs/OverviewTab.jsx',
  'src/components/admin/tabs/PostsTab.jsx',
  'src/components/admin/tabs/QuestionsTab.jsx',
  'src/components/admin/tabs/UsersTab.jsx'
)
foreach ($file in $files) {
  $c = [System.IO.File]::ReadAllText($file)
  $c = $c -replace "import \{ motion, AnimatePresence \} from 'framer-motion';\n", ''
  $c = $c -replace "import \{ motion \} from 'framer-motion';\n", ''
  $c = $c -replace "import \{ AnimatePresence \} from 'framer-motion';\n", ''
  $c = $c -replace "import \{ AnimatePresence, motion \} from 'framer-motion';\n", ''
  $c = [regex]::Replace($c, '<AnimatePresence[^>]*>', '<>')
  $c = $c -replace '</AnimatePresence>', '</>'
  $c = [regex]::Replace($c, '<motion\.(\w+)', '<$1')
  $c = [regex]::Replace($c, '</motion\.(\w+)>', '</$1>')
  $c = [regex]::Replace($c, '\s+variants=\{[a-zA-Z]+\}', '')
  $c = [regex]::Replace($c, '\s+whileHover=\{[^\}]+\}', '')
  $c = [regex]::Replace($c, '\s+initial=\{[^\}]+\}', '')
  $c = [regex]::Replace($c, '\s+animate=\{[^\}]+\}', '')
  $c = [regex]::Replace($c, '\s+exit=\{[^\}]+\}', '')
  $c = [regex]::Replace($c, '\s+transition=\{[^\}]+\}', '')
  [System.IO.File]::WriteAllText((Resolve-Path $file).Path, $c, [System.Text.Encoding]::UTF8)
  Write-Host "Fixed: $file"
}
