# PowerShell 脚本：生成 2000 个托业单词

$inputPath = "C:\Users\hp\Desktop\托业单词纯文本整理.txt"
$outputPath = "C:\Users\hp\.openclaw\workspace\toeic-game\src\toeicWords-full.js"

# 读取文件（使用 Default 编码，即 GBK）
$content = Get-Content $inputPath -Encoding Default -Raw

# 按行分割
$lines = $content -split "`r?`n"

$words = @()
$currentCategory = "通用商务"

# 处理每一行
foreach ($line in $lines) {
    $line = $line.Trim()
    
    # 跳过空行
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    
    # 跳过分类标题
    if ($line.StartsWith("-") -or $line.StartsWith("About")) { continue }
    
    # 跳过注释和说明行
    if ($line.StartsWith("") -or $line.Contains("=") -or $line.Contains(":")) { continue }
    
    # 尝试用 tab 分割
    $parts = $line -split "`t+"
    if ($parts.Count -ge 2) {
        $word = $parts[0].Trim()
        $meaning = $parts[1].Trim()
        
        # 清理单词（去除括号、词性等）
        $word = $word -replace "\([^)]*\)", "" -replace "\[.*?\]", "" -replace "vt\.|vi\.|n\.|adj\.|adv\.", ""
        $word = $word.Trim()
        
        # 验证单词有效性
        if ($word.Length -ge 2 -and $word -match "^[a-zA-Z]" -and -not $word.Contains(" ")) {
            # 清理释义
            $meaning = $meaning -replace "\s+", " "
            
            if (-not [string]::IsNullOrWhiteSpace($meaning)) {
                $words += [PSCustomObject]@{
                    Word = $word
                    Meaning = $meaning
                }
            }
        }
    }
}

# 去重
$uniqueWords = $words | Sort-Object -Property Word -Unique

Write-Host "`n处理完成！"
Write-Host "原始单词数：$($words.Count)"
Write-Host "去重后单词数：$($uniqueWords.Count)"

# 生成 JavaScript 文件
$limit = [Math]::Min($uniqueWords.Count, 2000)
$selectedWords = $uniqueWords | Select-Object -First $limit

$jsContent = @"
// 托业核心词汇库 - $($selectedWords.Count) 个高频单词
// 包含托业考试所有高频词汇，分为 $([Math]::Ceiling($selectedWords.Count / 10)) 关，每关 10 个单词
// 自动生成于 $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

export const toeicWords = [
$(@($selectedWords | ForEach-Object {
    $w = $_.Word -replace "'", "\\'"
    $m = $_.Meaning -replace "'", "\\'"
    "  { word: '$w', phonetic: '', meaning: '$m' }"
}) -join ",`n")
];
"@

# 写入文件
$jsContent | Out-File -FilePath $outputPath -Encoding utf8 -NoNewline

Write-Host "`n文件已保存到：$outputPath"
Write-Host "共生成 $($selectedWords.Count) 个单词"
Write-Host "可以分为 $([Math]::Ceiling($selectedWords.Count / 10)) 关"
