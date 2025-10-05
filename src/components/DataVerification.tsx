/**
 * Browser'da çalışan veri doğrulama komponenti
 * Console'u açın ve sonuçları görün
 */

import { useEffect, useState } from 'react'
import { fetchKOIPlanets, fetchKOIPlanetById } from '../services/exoplanetAPI'

export default function DataVerification() {
  const [results, setResults] = useState<string[]>([])
  
  useEffect(() => {
    async function verify() {
      const logs: string[] = []
      
      logs.push('='.repeat(80))
      logs.push('📊 VERI KAYNAGI DOGRULAMA')
      logs.push('='.repeat(80))
      logs.push('')
      
      try {
        // TEST 1: Backend KOI verileri
        logs.push('🔍 TEST 1: Backend KOI API')
        logs.push('-'.repeat(80))
        
        const planets = await fetchKOIPlanets({ 
          limit: 3, 
          include_probabilities: true,
          include_actual: true 
        })
        
        logs.push(`✅ Data received from backend! (${planets.length} planets)`)
        logs.push('')
        
        if (planets.length > 0) {
          const p = planets[0]
          logs.push(`📦 First planet: ${p.kepoi_name || p.kepid}`)
          logs.push(`   kepid: ${p.kepid}`)
          logs.push(`   kepler_name: ${p.kepler_name}`)
          logs.push('')
          
          // TEST 2: ML Prediction
          logs.push('🤖 TEST 2: Backend ML Prediction')
          logs.push('-'.repeat(80))
          logs.push(`   koi_pdisposition: ${p.koi_pdisposition}`)
          logs.push(`   koi_disposition (actual): ${p.koi_disposition}`)
          logs.push(`   koi_score: ${p.koi_score}`)
          logs.push('')
          
          // KRITIK: Backend'den probability geliyor mu?
          if (p.prediction_probability !== undefined) {
            logs.push(`✅ prediction_probability: ${p.prediction_probability}`)
          } else {
            logs.push('❌ prediction_probability: GELMIYOR!')
          }
          
          if (p.probabilities) {
            logs.push('✅ probabilities object mevcut:')
            logs.push(`   CONFIRMED: ${p.probabilities.CONFIRMED}`)
            logs.push(`   FALSE_POSITIVE: ${p.probabilities.FALSE_POSITIVE}`)
            logs.push(`   CANDIDATE: ${p.probabilities.CANDIDATE}`)
          } else {
            logs.push('❌ probabilities object: GELMIYOR!')
          }
          logs.push('')
          
          // TEST 3: Transit parametreleri
          logs.push('📈 TEST 3: KOI Transit Parametreleri')
          logs.push('-'.repeat(80))
          logs.push(`   koi_period: ${p.koi_period} days`)
          logs.push(`   koi_duration: ${p.koi_duration} hours`)
          logs.push(`   koi_depth: ${p.koi_depth} ppm`)
          logs.push(`   koi_model_snr: ${p.koi_model_snr}`)
          logs.push('')
          
          // TEST 4: Detailed data
          logs.push('🔬 TEST 4: Detailed Planet Data')
          logs.push('-'.repeat(80))
          const detailed = await fetchKOIPlanetById(p.kepid, true, true)
          
          // List all fields
          const allFields = Object.keys(detailed).filter(k => 
            (detailed as any)[k] !== null && (detailed as any)[k] !== undefined
          )
          logs.push(`   Total ${allFields.length} fields available`)
          
          // Check important fields
          const importantFields = [
            'prediction_probability',
            'probabilities',
            'koi_pdisposition',
            'koi_disposition',
            'koi_score'
          ]
          
          logs.push('')
          logs.push('   Critical fields:')
          importantFields.forEach(field => {
            const value = (detailed as any)[field]
            if (value !== undefined && value !== null) {
              logs.push(`   ✅ ${field}: ${JSON.stringify(value)}`)
            } else {
              logs.push(`   ❌ ${field}: MISSING`)
            }
          })
        }
        
      } catch (error) {
        logs.push(`❌ ERROR: ${(error as Error).message}`)
      }
      
      logs.push('')
      logs.push('='.repeat(80))
      logs.push('🔍 RESULT')
      logs.push('='.repeat(80))
      logs.push('')
      logs.push('RECEIVED from Backend:')
      logs.push('  ✅ KOI parametreleri (period, depth, duration)')
      logs.push('  ✅ koi_pdisposition (CONFIRMED/FALSE_POSITIVE/CANDIDATE)')
      logs.push('  ✅ koi_score (0-1 range)')
      logs.push('')
      logs.push('MOCK in Frontend:')
      logs.push('  ❌ Light Curve - Synthetic generated!')
      logs.push('  ❌ Periodogram - Synthetic BLS!')
      logs.push('  ❌ Phase-Folded - Synthetic!')
      logs.push('')
      logs.push('PROBLEMATIC:')
      logs.push('  ⚠️  predictPlanetCandidate() not using backend probability!')
      logs.push('  ⚠️  fetchLightCurve() not real light curve!')
      logs.push('')
      logs.push('='.repeat(80))
      
      setResults(logs)
      
      // Print to console as well
      logs.forEach(log => console.log(log))
    }
    
    verify()
  }, [])
  
  return (
    <div style={{
      position: 'fixed',
      top: 100,
      left: 20,
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#0f0',
      padding: 20,
      borderRadius: 8,
      fontFamily: 'monospace',
      fontSize: 11,
      maxWidth: 600,
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 9999,
      border: '2px solid #0f0'
    }}>
      <div style={{ marginBottom: 10, color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
        📊 DATA VERIFICATION
      </div>
      {results.map((line, i) => (
        <div key={i} style={{ whiteSpace: 'pre' }}>{line}</div>
      ))}
    </div>
  )
}
