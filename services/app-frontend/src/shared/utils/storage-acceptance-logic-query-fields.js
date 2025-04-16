export const StorageAcceptanceLogicCurioPipelineStatesFields = () => {
    return [
        "Any",
        "SDR",
        "Trees",
        "PrecommitMsg",
        "WaitSeed",
        "PoRep",
        "CommitMsg",
        "Encode",
        "Prove",
        "Submit",
        "MoveStorage"
    ]
}

export const StorageAcceptanceLogicCurioDealStagingStatesFields = () => {
    return [
        "AcceptedWaitingDownload",
        "Downloading",
        "Publishing",
        "Sealing"
    ]
}

export const StorageAcceptanceLogicSealingPipelineSectorStatesFields = () => {
    return [
        'WaitDeals',
        'Packing',
        'AddPiece',
        'GetTicket',
        'PreCommit1',
        'PreCommit2',
        'PreCommitting',
        'PreCommitWait',
        'SubmitPreCommitBatch',
        'PreCommitBatchWait',
        'WaitSeed',
        'Committing',
        'CommitFinalize',
        'SubmitCommit',
        'SubmitCommitAggregate',
        'CommitAggregateWait',
        'FinalizeSector',
        'Proving',
        'Available',
        'DealsExpired',
        'RecoverDealIDs',
        'Faulty',
        'FaultReported',
        'FaultedFinal',
        'Terminating',
        'TerminateWait',
        'TerminateFinality',
        'Removing',
        'Removed',
        'SnapDealsWaitDeals',
        'SnapDealsAddPiece',
        'SnapDealsPacking',
        'UpdateReplica',
        'ProveReplicaUpdate',
        'SubmitReplicaUpdate',
        'WaitMutable',
        'ReplicaUpdateWait',
        'UpdateActivating',
        'ReleaseSectorKey',
        'FinalizeReplicaUpdate',
        'SnapDealsDealsExpired',
        'SnapDealsRecoverDealIDs',
        'AbortUpgrade',
        'ReceiveSector',
    ]
}

export const StorageAcceptanceLogicSealingPipelineSectorStatesErrorsFields =
    () => {
        return [
            'Any',
            'AddPieceFailed',
            'CommitFinalizeFailed',
            'SealPreCommit1Failed',
            'SealPreCommit2Failed',
            'PreCommitFailed',
            'ComputeProofFailed',
            'RemoteCommitFailed',
            'CommitFailed',
            'FinalizeFailed',
            'SnapDealsAddPieceFailed',
            'ReplicaUpdateFailed',
            'ReleaseSectorKeyFailed',
            'FinalizeReplicaUpdateFailed',
            'PackingFailed',
            'TerminateFailed',
            'RemoveFailed',
        ]
    }

export const StorageAcceptanceLogicAdditionalFields = () => {
    return [
        {
            label: 'ReceivedOnTimeOfDayUTC',
            type: 'time',
            defaultOperator: 'between',
            excludeOperators: ['is_null', 'is_not_null'],
            operators: [
                'between',
                'not_between',
                'less_or_equal',
                'greater_or_equal',
                'less',
                'greater',
                'equal',
                'not_equal',
            ],
        },
        {
            label: 'ReceivedOnDayOfWeek',
            defaultOperator: 'multiselect_equals',
            type: 'day_of_week_multiselect',
            excludeOperators: [
                'multiselect_equals',
                'multiselect_not_equals',
                'is_null',
                'is_not_null',
            ],
            operators: ['multiselect_contains', 'multiselect_not_contains'],
            defaultValue: ['monday'],
        },
    ]
}
