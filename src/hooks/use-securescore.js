import { useMemo } from 'react'
import { ApiGetCall } from '../api/ApiCall'
import { useSettings } from './use-settings'
import { getStandards } from '../utils/standards-data'

export function useSecureScore({ waiting = true } = {}) {
  const currentTenant = useSettings().currentTenant
  const isAllTenants = currentTenant === 'AllTenants'

  const controlScore = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: 'security/secureScoreControlProfiles',
      tenantFilter: currentTenant,
      $count: true,
      $top: 999,
    },
    queryKey: `controlScore-${currentTenant}`,
    // AllTenants reads the nightly cache instead of these live per-tenant Graph results.
    waiting: waiting && !isAllTenants,
  })

  const secureScore = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: 'security/secureScores',
      tenantFilter: currentTenant,
      $count: true,
      noPagination: true,
      $top: 7,
    },
    queryKey: `secureScore-${currentTenant}`,
    // AllTenants reads the nightly cache instead of these live per-tenant Graph results.
    waiting: waiting && !isAllTenants,
  })

  const isFetching = !isAllTenants && (controlScore.isFetching || secureScore.isFetching)
  const isSuccess = !isAllTenants && controlScore.isSuccess && secureScore.isSuccess

  const translatedData = useMemo(() => {
    if (!isSuccess) return []
    const secureScoreData = secureScore.data.Results[0]
    const updatedControlScores = secureScoreData.controlScores.map((control) => {
      const translation = controlScore.data.Results?.find(
        (controlTranslation) => controlTranslation.id === control.controlName
      )
      const remediation = getStandards().find((standard) =>
        standard.tag?.includes(control.controlName)
      )
      return {
        ...control,
        title: translation?.title,
        threats: translation?.threats,
        complianceInformation: translation?.complianceInformation,
        actionUrl: remediation
          ? //this needs to be updated to be a direct url to apply this standard.
            '/tenant/standards'
          : translation?.actionUrl,
        remediation: remediation
          ? `1. Enable the CIPP Standard: ${remediation.label}`
          : translation?.remediation,
        remediationImpact: translation?.remediationImpact,
        implementationCost: translation?.implementationCost,
        tier: translation?.tier,
        userImpact: translation?.userImpact,
        vendorInformation: translation?.vendorInformation,
        controlStateUpdates: translation?.controlStateUpdates //remove each controlStateUpdate that has the state 'default' as it is not relevant.
          ? translation.controlStateUpdates.filter((update) => update.state !== 'Default')
          : [],
      }
    })
    updatedControlScores.sort((a, b) => b.scoreInPercentage - a.scoreInPercentage)
    return {
      ...secureScoreData,
      //secureScoreData.currentscore is the current score, secureScoreData.maxscore is the max score. calculate % reached.
      percentageCurrent: Math.round(
        (secureScoreData.currentScore / secureScoreData.maxScore) * 100
      ),
      percentageVsAllTenants: Math.round(
        secureScoreData.averageComparativeScores?.[0]?.averageScore
      ),
      percentageVsSimilar: Math.round(secureScoreData.averageComparativeScores?.[1]?.averageScore),
      controlScores: updatedControlScores,
    }
  }, [isSuccess, controlScore.data, secureScore.data])

  return {
    controlScore,
    secureScore,
    translatedData,
    isFetching,
    isSuccess,
  }
}
