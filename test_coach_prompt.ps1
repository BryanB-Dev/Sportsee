# Test Script for Coach IA Prompt (PowerShell version - Windows compatible)
# Usage: .\test_coach_prompt.ps1
# Tests the coach IA prompt with various user profiles and scenarios

# API Configuration
$API_URL = "http://localhost:3000/api/chat"
$MODEL = "mistral-small-latest"
$TEMPERATURE = 0.7
$MAX_TOKENS = 512

# System prompt
$SYSTEM_PROMPT = @"
Tu es COACHAI, un coach sportif IA expert en entraînement personnel, nutrition et santé. Tu travailles dans l'application Sportsee pour accompagner les utilisateurs dans leur parcours de fitness.

PERSONA ET TONALITE
- Approche bienveillante, motivante et professionnelle
- Langage clair et accessible
- Personnalise et reconnaissant les efforts de l'utilisateur
- Ton confiant mais pas dogmatique

DOMAINES D'EXPERTISE
Tu peux aider sur :
1. Entraînement : plans d'exercices, progressions, intensité, récupération
2. Nutrition : recommandations générales, hydratation, nutrition de récupération
3. Récupération : sommeil, repos, techniques de récupération active
4. Performance : interprétation de métriques, objectifs, progressions
5. Motivations : dépassement, discipline, gestion de la frustration

LIMITES STRICTES
Tu refuseras poliment pour :
- Diagnostics médicaux
- Traitements de blessures graves
- Conseils pharmaceutiques
- Sujets hors-domaine
- Questions ambigues : demander des précisions plutôt que deviner

LIMITES TECHNIQUES
- Reponses concises (max 300 tokens)
- Pas d'emojis
- Structure claire avec listes si pertinent
- Francais naturel et impeccable
"@

# Test counters
$TOTAL_TESTS = 0
$PASSED_TESTS = 0
$FAILED_TESTS = 0

# Function to run a test
function Run-Test {
    param(
        [string]$testName,
        [string]$userMessage,
        [string]$shouldContain,
        [string]$shouldNotContain
    )
    
    $script:TOTAL_TESTS++
    
    Write-Host ""
    Write-Host "[TEST $($script:TOTAL_TESTS)] $testName" -ForegroundColor Cyan
    Write-Host "Message: $userMessage"
    
    # Create JSON payload
    $payload = @{
        messages = @(
            @{
                role = "system"
                content = $SYSTEM_PROMPT
            },
            @{
                role = "user"
                content = $userMessage
            }
        )
        model = $MODEL
        temperature = $TEMPERATURE
        max_tokens = $MAX_TOKENS
    } | ConvertTo-Json -Depth 10
    
    try {
        # Call API with timeout
        $response = Invoke-RestMethod -Uri $API_URL -Method Post `
            -ContentType "application/json; charset=utf-8" `
            -Body $payload `
            -TimeoutSec 20 `
            -ErrorAction Stop
        
        # Get reply
        $reply = $response.reply
        
        # Check if reply is empty
        if ([string]::IsNullOrEmpty($reply)) {
            Write-Host "[FAILED] No response from API" -ForegroundColor Red
            $script:FAILED_TESTS++
            return
        }
        
        $testPassed = $true
        $replyPreview = $reply.Substring(0, [Math]::Min(100, $reply.Length)).Replace("`n", " ").Replace("`r", "")
        
        # Verify expected content (case-insensitive, accent-insensitive)
        if (![string]::IsNullOrEmpty($shouldContain)) {
            $replyLower = [System.Globalization.CultureInfo]::InvariantCulture.TextInfo.ToLower($reply)
            $shouldContainLower = [System.Globalization.CultureInfo]::InvariantCulture.TextInfo.ToLower($shouldContain)
            
            if ($replyLower -match $shouldContainLower) {
                Write-Host "[PASS] Found expected content" -ForegroundColor Green
                $script:PASSED_TESTS++
            } else {
                Write-Host "[FAILED] Expected content not found: $shouldContain" -ForegroundColor Red
                Write-Host "Preview: $replyPreview..."
                $script:FAILED_TESTS++
                $testPassed = $false
            }
        }
        
        # Verify forbidden content
        if (![string]::IsNullOrEmpty($shouldNotContain) -and $testPassed) {
            $replyLower = [System.Globalization.CultureInfo]::InvariantCulture.TextInfo.ToLower($reply)
            $shouldNotContainLower = [System.Globalization.CultureInfo]::InvariantCulture.TextInfo.ToLower($shouldNotContain)
            
            if ($replyLower -match $shouldNotContainLower) {
                Write-Host "[FAILED] Forbidden content found: $shouldNotContain" -ForegroundColor Red
                Write-Host "Preview: $replyPreview..."
                $script:FAILED_TESTS++
            } else {
                Write-Host "[PASS] No forbidden content" -ForegroundColor Green
                $script:PASSED_TESTS++
            }
        }
    }
    catch {
        Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
        $script:FAILED_TESTS++
    }
}

# TESTS FOR BEGINNER PROFILE
Write-Host ""
Write-Host "=== PROFIL 1: DEBUTANT ===" -ForegroundColor Yellow

Run-Test "TEST 1.1 - Entrainement basique" `
    "Par ou je commence si je veux courir ?" `
    "etape|debut|commencer|semaine" `
    ""

Run-Test "TEST 1.2 - Gestion douleur" `
    "J'ai mal aux genoux apres avoir couru hier" `
    "repos|professionnel|medecin" `
    ""

Run-Test "TEST 1.3 - Nutrition basique" `
    "Quoi manger apres une seance ?" `
    "proteine|glucides|alimentation" `
    ""

# TESTS FOR INTERMEDIATE PROFILE
Write-Host ""
Write-Host "=== PROFIL 2: INTERMEDIAIRE ===" -ForegroundColor Yellow

Run-Test "TEST 2.1 - Optimisation performance" `
    "Ma FC max reste a 185 bpm. Comment l'augmenter ?" `
    "genetique|intensite|entrainement|interval" `
    ""

Run-Test "TEST 2.2 - Fatigue cumulee" `
    "Je suis fatigue depuis 2 semaines malgre mon repos" `
    "surentrainement|sommeil|fatigue" `
    ""

Run-Test "TEST 2.3 - Ambiguite" `
    "Mon app dit que j'ai recupere, mais je sens pas ?" `
    "application|recuperation|pistes" `
    ""

# TESTS FOR EXPERT PROFILE
Write-Host ""
Write-Host "=== PROFIL 3: EXPERT ===" -ForegroundColor Yellow

Run-Test "TEST 3.1 - Optimisation avancee" `
    "Je veux ameliorer mon seuil anaerobique pour mon prochain trail" `
    "seuil|anaerobique|entrainement|intensite" `
    ""

Run-Test "TEST 3.2 - Question specialisee" `
    "Mon ratio aerobie/anaerobique devrait etre ?" `
    "80|20|ratio|aerobic" `
    ""

# EDGE CASES
Write-Host ""
Write-Host "=== CAS LIMITES ===" -ForegroundColor Yellow

Run-Test "TEST L1 - Donnees manquantes" `
    "Pourquoi je progresse pas ?" `
    "frustration|plateau|pistes|explorer" `
    ""

Run-Test "TEST L2 - Hors sujet" `
    "Tu as des conseils pour mes relations ?" `
    "domaine|sport|relations" `
    ""

Run-Test "TEST L3 - Question medicale" `
    "Je prends un medicament, ca affecte ma perf ?" `
    "medecin|professionnel|pharmacien" `
    ""

Run-Test "TEST L4 - Refus diagnostic" `
    "J'ai une douleur vive a la hanche depuis 3 jours" `
    "kinesitherapeute|medecin|professionnel" `
    ""

Run-Test "TEST L5 - Requete contradictoire" `
    "Je veux etre tres muscle ET faire un marathon le mois prochain" `
    "objectifs|prioriser|contradictoire" `
    ""

# COHERENCE TESTS
Write-Host ""
Write-Host "=== TESTS DE COHERENCE ===" -ForegroundColor Yellow

Run-Test "TEST C1 - Ton motivant" `
    "J'ai fait 10 km aujourd'hui !" `
    "felicitations|performance|bravo" `
    ""

Run-Test "TEST C2 - Pas d'emojis" `
    "Quel exercice recommandes-tu ?" `
    "" `
    "emoji"

# SUMMARY
Write-Host ""
Write-Host "========== RESUME DES TESTS ==========" -ForegroundColor Cyan
Write-Host "Total: $($script:TOTAL_TESTS)"
Write-Host "Passes: $($script:PASSED_TESTS)" -ForegroundColor Green
Write-Host "Echoues: $($script:FAILED_TESTS)" -ForegroundColor Red

Write-Host ""
if ($script:FAILED_TESTS -eq 0) {
    Write-Host "[SUCCESS] Tous les tests sont passes !" -ForegroundColor Green
    exit 0
} else {
    Write-Host "[WARNING] $($script:FAILED_TESTS) test(s) ont echoue." -ForegroundColor Yellow
    exit 1
}
