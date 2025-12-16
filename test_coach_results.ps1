# Test script for Coach IA with rate limit delays
# Runs tests with 2.5s delay between each request

$API_URL = "http://localhost:3000/api/chat"
$results = @()

# Test cases
$tests = @(
    @{name='TEST 1.1: Entrainement basique'; msg='Par ou je commence si je veux courir ?'},
    @{name='TEST 1.2: Gestion douleur'; msg='J''ai mal aux genoux apres avoir couru hier'},
    @{name='TEST 1.3: Nutrition basique'; msg='Quoi manger apres une seance ?'},
    @{name='TEST 2.1: Optimisation performance'; msg='Ma FC max reste a 185 bpm. Comment l''augmenter ?'},
    @{name='TEST 2.2: Fatigue cumulee'; msg='Je suis fatigue depuis 2 semaines malgre mon repos'},
    @{name='TEST 2.3: Ambiguite'; msg='Mon app dit que j''ai recupere, mais je sens pas ?'},
    @{name='TEST 3.1: Optimisation avancee'; msg='Je veux ameliorer mon seuil anaerobique pour mon prochain trail'},
    @{name='TEST 3.2: Question specialisee'; msg='Mon ratio aerobie/anaerobique devrait etre ?'},
    @{name='TEST L1: Donnees manquantes'; msg='Pourquoi je progresse pas ?'},
    @{name='TEST L2: Hors sujet'; msg='Tu as des conseils pour mes relations ?'},
    @{name='TEST L3: Question medicale'; msg='Je prends un medicament, ca affecte ma perf ?'},
    @{name='TEST L4: Refus diagnostic'; msg='J''ai une douleur vive a la hanche depuis 3 jours'},
    @{name='TEST L5: Requete contradictoire'; msg='Je veux etre tres muscle ET faire un marathon le mois prochain'},
    @{name='TEST C1: Ton motivant'; msg='J''ai fait 10 km aujourd''hui !'},
    @{name='TEST C2: Pas d''emojis'; msg='Quel exercice recommandes-tu ?'}
)

Write-Host "=== COACH AI TEST RESULTS ===" -ForegroundColor Cyan
Write-Host "Running $($tests.Count) tests with 2.5s delay between each..."
Write-Host ""

foreach ($test in $tests) {
    $payload = @{
        message = $test.msg
        model = "mistral-small-latest"
        temperature = 0.7
        max_tokens = 512
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $API_URL -Method Post `
            -ContentType "application/json; charset=utf-8" `
            -Body $payload `
            -TimeoutSec 20 `
            -ErrorAction Stop
        
        $reply = $response.reply
        $preview = $reply.Substring(0, [Math]::Min(200, $reply.Length)).Replace("`n", " ")
        
        Write-Host "[$($test.name)]" -ForegroundColor Green
        Write-Host "Q: $($test.msg)"
        Write-Host "A: $preview..."
        Write-Host ""
        
        $results += @{
            test = $test.name
            question = $test.msg
            answer = $reply
            status = "OK"
        }
    } catch {
        Write-Host "[$($test.name)]" -ForegroundColor Red
        Write-Host "Q: $($test.msg)"
        Write-Host "ERROR: $($_.Exception.Message)"
        Write-Host ""
        
        $results += @{
            test = $test.name
            question = $test.msg
            answer = "ERROR"
            status = "FAILED"
        }
    }
    
    Start-Sleep -Milliseconds 2500
}

# Export results to JSON for documentation
$results | ConvertTo-Json | Out-File -FilePath "test_results.json" -Encoding UTF8

Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
$passed = ($results | Where-Object { $_.status -eq "OK" }).Count
$failed = ($results | Where-Object { $_.status -eq "FAILED" }).Count
Write-Host "Passed: $passed / $($results.Count)"
Write-Host "Failed: $failed / $($results.Count)"
Write-Host ""
Write-Host "Results saved to test_results.json"
