import { peerIdFromString } from '@libp2p/peer-id'
import { useEffect, useState } from 'react'
import { Prompt } from 'react-router'
import { toast } from 'react-toastify'
import { Col, Row } from 'reactstrap'
import { Loader } from 'shared/components'
import { GetCurrentAddress } from 'shared/services/addresses_claim'
import { GetAllRetrievalClientsForCurrentUser } from 'shared/services/client'
import {
    ApplyAclChanges,
    GetAllBlacklisted,
    GetAllWhitelisted,
} from 'shared/services/retrieval-acl'
import { clientArrayToSelectObjectWithPeerIds } from 'shared/utils/array-utils'
import { RetrievalAclApply, RetrievalAclEmptyWhitelist } from 'shared/modals'
import { useTranslation } from 'react-i18next'

import {
    calculateAdded,
    calculateAddedDTO,
    calculateNewModifiedListOnAdd,
    calculateRemoved,
    calculateRemovedDTO,
    calculateSelectedClient,
    calculateSelectedPeerId,
    currentBehaviorToBool,
    currentBehaviorToString,
    filterOutAcl,
    getAmountChanges,
    getClientIdsFromAclList,
    getPeerIdsFromAclList,
    isAclUnmodified,
    isAlreadyInAclList,
    isChangingToEmptyWhitelist,
    removeFromAcl,
} from 'shared/utils/retrievalAclUtil'
import { RetrievalAclView } from './RetrievalAclView'

export function RetrievalAclContainer() {
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)
    const [errorExplanation, setErrorExplanation] = useState('')
    // true if whitelist and false if blacklist
    const [currentBehavior, setCurrentBehavior] = useState(false)
    const [modifiedCurrentBehavior, setModifiedCurrentBehavior] =
        useState(currentBehavior)
    const [
        selectedPeerOrClientIdBlacklist,
        setSelectedPeerOrClientIdBlacklist,
    ] = useState(null)
    const [
        selectedPeerOrClientIdWhitelist,
        setSelectedPeerOrClientIdWhitelist,
    ] = useState(null)
    const [commentBlacklist, setCommentBlacklist] = useState('')
    const [commentWhitelist, setCommentWhitelist] = useState('')
    const [clients, setClients] = useState([])
    const [clientsForSelectionBlacklist, setClientsForSelectionBlacklist] =
        useState([])
    const [clientsForSelectionWhitelist, setClientsForSelectionWhitelist] =
        useState([])
    const [whitelist, setWhitelist] = useState([])
    const [blacklist, setBlacklist] = useState([])
    const [modifiedWhitelist, setModifiedWhitelist] = useState([]) // the whole list that was modified
    const [modifiedBlacklist, setModifiedBlacklist] = useState([])
    const [addedWhitelist, setAddedWhitelist] = useState([])
    const [addedBlacklist, setAddedBlacklist] = useState([])
    const [removedWhitelist, setRemovedWhitelist] = useState([])
    const [removedBlacklist, setRemovedBlacklist] = useState([])
    const [isAddBlacklistModalOpen, setIsAddBlacklistModalOpen] =
        useState(false)
    const [isClosingAddBlacklistModal, setIsClosingAddBlacklistModal] =
        useState(false)
    const [isAddWhitelistModalOpen, setIsAddWhitelistModalOpen] =
        useState(false)
    const [isClosingAddWhitelistModal, setIsClosingAddWhitelistModal] =
        useState(false)
    const [isEmptyWhitelistModalOpen, setIsEmptyWhitelistModalOpen] =
        useState(false)
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
    const [isApplyLoading, setIsApplyLoading] = useState(false)
    const [isAlreadyInBlacklist, setIsAlreadyInBlacklist] = useState(false)
    const [isAlreadyInWhitelist, setIsAlreadyInWhitelist] = useState(false)
    const [hasErrorAddWhitelistForm, setHasErrorAddWhitelistForm] =
        useState(false)
    const [hasErrorAddBlacklistForm, setHasErrorAddBlacklistForm] =
        useState(false)
    const [
        errorExplanationSelectedElemBlacklist,
        setErrorExplanationSelectedElemBlacklist,
    ] = useState('')
    const [
        errorExplanationSelectedElemWhitelist,
        setErrorExplanationSelectedElemWhitelist,
    ] = useState('')

    const { t } = useTranslation('RetrievalAclContainer') // second param ignored i18n

    useEffect(() => {
        const unwantedClientIds = getClientIdsFromAclList(modifiedBlacklist)
        const unwantedPeerIds = getPeerIdsFromAclList(modifiedBlacklist)
        const newClientsForSelectionBlacklist =
            clientArrayToSelectObjectWithPeerIds(
                clients,
                unwantedClientIds,
                unwantedPeerIds
            )
        setClientsForSelectionBlacklist(newClientsForSelectionBlacklist)
    }, [clients, modifiedBlacklist])

    useEffect(() => {
        const unwantedClientIds = getClientIdsFromAclList(modifiedWhitelist)
        const unwantedPeerIds = getPeerIdsFromAclList(modifiedWhitelist)
        const newClientsForSelectionWhitelist =
            clientArrayToSelectObjectWithPeerIds(
                clients,
                unwantedClientIds,
                unwantedPeerIds
            )
        setClientsForSelectionWhitelist(newClientsForSelectionWhitelist)
    }, [clients, modifiedWhitelist])

    useEffect(() => {
        if (isLoading) {
            // Load all peerIds for existing clients
            GetAllRetrievalClientsForCurrentUser()
                .then((response) => {
                    if (response.data) {
                        const clients = response.data
                        const clientsNotArchived = clients.filter(
                            (client) => !client.archived
                        )
                        setClients(clientsNotArchived)
                    }
                })
                .catch((e) => {
                    console.log('Error while loading current users', e)
                    setIsError(true)
                    setErrorExplanation(t('error.unableToFetchClients'))
                })

            // Load address settings (whitelist / blacklist)
            GetCurrentAddress({})
                .then((response) => {
                    const settings = response.data.settings
                    setCurrentBehavior(
                        currentBehaviorToBool(settings.retrievalDefaultBehavior)
                    )
                    setModifiedCurrentBehavior(
                        currentBehaviorToBool(settings.retrievalDefaultBehavior)
                    )
                })
                .catch((e) => {
                    console.log(
                        'Error while loading retrieval default behavior',
                        e
                    )
                    setIsError(true)
                    setErrorExplanation('error.unableToFetchCurrentBehavior')
                })
            // Get Whitelist
            GetAllWhitelisted()
                .then((response) => {
                    setWhitelist(response.data.response)
                    setModifiedWhitelist(response.data.response)
                })
                .catch((e) => {
                    console.log('Error while loading whitelist', e)
                    setErrorExplanation(t('error.unableToFetchWhitelist'))
                    setIsError(true)
                })
            // Get Blacklist
            GetAllBlacklisted()
                .then((response) => {
                    setBlacklist(response.data.response)
                    setModifiedBlacklist(response.data.response)
                    setIsLoading(false)
                })
                .catch((e) => {
                    console.log('Error while loading blacklist', e)
                    setIsError(true)
                    setErrorExplanation(t('error.unableToFetchBlacklist'))
                })
        }
    }, [isLoading, t])

    useEffect(() => {
        const newRemovedBlacklist = calculateRemoved(
            blacklist,
            modifiedBlacklist
        )
        setRemovedBlacklist(newRemovedBlacklist)

        const newAddedBlacklist = calculateAdded(blacklist, modifiedBlacklist)
        setAddedBlacklist(newAddedBlacklist)
    }, [modifiedBlacklist, blacklist])

    useEffect(() => {
        const newRemovedWhitelist = calculateRemoved(
            whitelist,
            modifiedWhitelist
        )
        setRemovedWhitelist(newRemovedWhitelist)

        const newAddedWhitelist = calculateAdded(whitelist, modifiedWhitelist)
        setAddedWhitelist(newAddedWhitelist)
    }, [modifiedWhitelist, whitelist])

    useEffect(() => {
        if (selectedPeerOrClientIdWhitelist === null) {
            setHasErrorAddWhitelistForm(true)
            setErrorExplanationSelectedElemWhitelist(
                t('validation.whitelist.isSelectedElemEmpty')
            )
            return
        }
        const isAlreadyInWhitelist = isAlreadyInAclList(
            selectedPeerOrClientIdWhitelist,
            modifiedWhitelist
        )
        if (isAlreadyInWhitelist || commentWhitelist.length > 255) {
            setHasErrorAddWhitelistForm(true)
        } else {
            setHasErrorAddWhitelistForm(false)
        }
        if (isAlreadyInWhitelist) {
            setErrorExplanationSelectedElemWhitelist(
                t('validation.whitelist.isSelectedElemAlreadyInWhitelist')
            )
        } else {
            setErrorExplanationSelectedElemWhitelist('')
        }
        // eventually add comment error explanation
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPeerOrClientIdWhitelist, commentWhitelist, t])

    useEffect(() => {
        if (selectedPeerOrClientIdBlacklist === null) {
            setHasErrorAddBlacklistForm(true)
            setErrorExplanationSelectedElemBlacklist(
                t('validation.blacklist.isSelectedElemEmpty')
            )
            return
        }
        const isAlreadyInBlacklist = isAlreadyInAclList(
            selectedPeerOrClientIdBlacklist,
            modifiedBlacklist
        )
        if (isAlreadyInBlacklist || commentBlacklist.length > 255) {
            setHasErrorAddBlacklistForm(true)
        } else {
            setHasErrorAddBlacklistForm(false)
        }
        if (isAlreadyInBlacklist) {
            setErrorExplanationSelectedElemBlacklist(
                t('validation.blacklist.isSelectedElemAlreadyInBlacklist')
            )
        } else {
            setErrorExplanationSelectedElemBlacklist('')
        }
        // eventually add comment error explanation
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPeerOrClientIdBlacklist, commentBlacklist, t])

    // These is necessary to avoid scroll bar to disappear. isAlreadyInBlacklistModal should close BEFORE the other modal.
    useEffect(() => {
        if (isClosingAddWhitelistModal && !isAlreadyInBlacklist) {
            setIsAddWhitelistModalOpen(false)
            setIsClosingAddWhitelistModal(false)
        }
    }, [isClosingAddWhitelistModal, isAlreadyInBlacklist])

    // These is necessary to avoid scroll bar to disappear. isAlreadyInWhitelistModal should close BEFORE the other modal.
    useEffect(() => {
        if (isClosingAddBlacklistModal && !isAlreadyInWhitelist) {
            setIsAddBlacklistModalOpen(false)
            setIsClosingAddBlacklistModal(false)
        }
    }, [isClosingAddBlacklistModal, isAlreadyInWhitelist])

    const handleAclBehaviorChange = (_event) => {
        const newModifiedCurrentBehavior = !modifiedCurrentBehavior
        setModifiedCurrentBehavior(newModifiedCurrentBehavior)
    }

    const handleValueNotInClientListBlacklist = (value) => {
        try {
            peerIdFromString(value)

            const newSelectedPeerOrClientId = calculateSelectedPeerId(value)
            setSelectedPeerOrClientIdBlacklist(newSelectedPeerOrClientId)
        } catch (error) {
            console.error(error)
            setErrorExplanationSelectedElemBlacklist(
                t('validation.blacklist.isSelectedPeerIdInvalid')
            )
        }
    }

    const handleValueNotInClientListWhitelist = (value) => {
        try {
            peerIdFromString(value)

            const newSelectedPeerOrClientId = calculateSelectedPeerId(value)
            setSelectedPeerOrClientIdWhitelist(newSelectedPeerOrClientId)
        } catch (error) {
            console.error(error)
            setErrorExplanationSelectedElemWhitelist(
                t('validation.whitelist.isSelectedPeerIdInvalid')
            )
        }
    }

    const handleChooseClientOrClientPeerIdWhitelist = (value) => {
        const newSelectedPeerOrClientId = calculateSelectedClient(value)
        setSelectedPeerOrClientIdWhitelist(newSelectedPeerOrClientId)
    }

    const handleChooseClientOrClientPeerIdBlacklist = (value) => {
        const newSelectedPeerOrClientId = calculateSelectedClient(value)
        setSelectedPeerOrClientIdBlacklist(newSelectedPeerOrClientId)
    }

    const handleOnAddToWhitelist = () => {
        if (
            isAlreadyInAclList(
                selectedPeerOrClientIdWhitelist,
                modifiedBlacklist
            )
        ) {
            setIsAlreadyInBlacklist(true)
            return
        }

        addToWhitelist()
    }

    const addToWhitelist = () => {
        const newModifiedWhitelist = calculateNewModifiedListOnAdd(
            modifiedWhitelist,
            selectedPeerOrClientIdWhitelist,
            commentWhitelist,
            clients
        )
        setModifiedWhitelist(newModifiedWhitelist)
        resetFormWhitelist()
    }

    const handleOnAddToBlacklist = () => {
        if (
            isAlreadyInAclList(
                selectedPeerOrClientIdBlacklist,
                modifiedWhitelist
            )
        ) {
            setIsAlreadyInWhitelist(true)
            return
        }

        addToBlacklist()
    }

    const addToBlacklist = () => {
        const newModifiedBlacklist = calculateNewModifiedListOnAdd(
            modifiedBlacklist,
            selectedPeerOrClientIdBlacklist,
            commentBlacklist,
            clients
        )
        setModifiedBlacklist(newModifiedBlacklist)
        resetFormBlacklist()
    }

    const handleOnConfirmReplaceWhitelistToBlacklist = () => {
        // remove from whitelist
        const newModifiedWhitelist = removeFromAcl(
            selectedPeerOrClientIdBlacklist,
            modifiedWhitelist
        )
        setModifiedWhitelist(newModifiedWhitelist)

        // add to blacklist
        addToBlacklist()
    }

    const handleOnConfirmReplaceBlacklistToWhitelist = () => {
        // remove from blacklist
        const newModifiedBlacklist = removeFromAcl(
            selectedPeerOrClientIdWhitelist,
            modifiedBlacklist
        )
        setModifiedBlacklist(newModifiedBlacklist)

        // add to whitelist
        addToWhitelist()
    }

    const resetFormBlacklist = () => {
        setCommentBlacklist('')
        setSelectedPeerOrClientIdBlacklist(null)
        setIsAlreadyInWhitelist(false)
        setIsClosingAddBlacklistModal(true)
    }

    const resetFormWhitelist = () => {
        setCommentWhitelist('')
        setSelectedPeerOrClientIdWhitelist(null)
        setIsAlreadyInBlacklist(false)
        setIsClosingAddWhitelistModal(true)
    }

    const handleOnDeleteFromWhitelist = (aclEntry) => {
        const newModifiedWhitelist = filterOutAcl(aclEntry, modifiedWhitelist)
        setModifiedWhitelist(newModifiedWhitelist)
    }

    const handleOnDeleteFromBlacklist = (aclEntry) => {
        const newModifiedBlacklist = filterOutAcl(aclEntry, modifiedBlacklist)
        setModifiedBlacklist(newModifiedBlacklist)
    }

    const handleOnChangeCommentBlacklist = (str) => {
        if (str === undefined || str === null) {
            return
        }
        const newStr = str.substr(0, 255) // we don't accept strings of length > 255
        setCommentBlacklist(newStr)
    }

    const handleOnChangeCommentWhitelist = (str) => {
        if (str === undefined || str === null) {
            return
        }
        const newStr = str.substr(0, 255) // we don't accept strings of length > 255
        setCommentWhitelist(newStr)
    }

    // This is transactional
    const doApply = async () => {
        setIsApplyLoading(true)
        const removedDTO = calculateRemovedDTO(
            removedWhitelist,
            removedBlacklist
        )
        const addedWhitelistDTO = calculateAddedDTO(addedWhitelist)
        const addedBlacklistDTO = calculateAddedDTO(addedBlacklist)
        const applyAclChangesDTO = {
            modifiedDefaultBehavior:
                modifiedCurrentBehavior !== currentBehavior
                    ? currentBehaviorToString(modifiedCurrentBehavior)
                    : undefined,
            addedWhitelist: addedWhitelistDTO?.length
                ? addedWhitelistDTO
                : undefined,
            addedBlacklist: addedBlacklistDTO?.length
                ? addedBlacklistDTO
                : undefined,
            removed: removedDTO?.length ? removedDTO : undefined,
        }
        try {
            await ApplyAclChanges(applyAclChangesDTO)
            setIsLoading(true)
            setIsApplyLoading(false)
            toast.success(t('notification.success.onApplyAcl'))
        } catch (err) {
            setIsApplyLoading(false)
            throw new Error('Cannot apply ACL changes', { cause: err })
        }
    }

    const handleOnApply = () => {
        if (
            isChangingToEmptyWhitelist(
                modifiedWhitelist,
                modifiedCurrentBehavior,
                currentBehavior
            )
        ) {
            setIsEmptyWhitelistModalOpen(true)
        } else {
            setIsApplyModalOpen(true)
        }
    }

    const componentOnError = () => {
        return (
            <>
                <Row className="mt-4">
                    <div
                        className="alert alert-danger"
                        role="alert"
                        style={{ marginTop: '50px' }}
                    >
                        {errorExplanation}
                    </div>
                </Row>
            </>
        )
    }

    const componentOnLoading = () => {
        return (
            <>
                <Row className="mt-4">
                    <Loader />
                </Row>
            </>
        )
    }

    const componentWhenLoaded = () => {
        return (
            <>
                <div
                    id="componentWhenLoadedContainer"
                    className="d-flex p-2 flex-column"
                >
                    <RetrievalAclView
                        type={'blacklist'}
                        modifiedAclList={modifiedBlacklist}
                        checked={!modifiedCurrentBehavior}
                        isCurrentlyAppliedAcl={currentBehavior === false}
                        onCheckedChange={handleAclBehaviorChange}
                        handleChooseClientOrClientPeerId={
                            handleChooseClientOrClientPeerIdBlacklist
                        }
                        handleValueNotInClientList={
                            handleValueNotInClientListBlacklist
                        }
                        clients={clients}
                        clientsForSelection={clientsForSelectionBlacklist}
                        selectedPeerOrClientId={selectedPeerOrClientIdBlacklist}
                        isAddFormDisabled={hasErrorAddBlacklistForm}
                        errorExplanationSelectedElem={
                            errorExplanationSelectedElemBlacklist
                        }
                        comment={commentBlacklist}
                        handleOnChangeComment={handleOnChangeCommentBlacklist}
                        handleOnAddToAcl={handleOnAddToBlacklist}
                        handleOnDeleteFromAcl={handleOnDeleteFromBlacklist}
                        isModalFormOpen={isAddBlacklistModalOpen}
                        setIsModalFormOpen={setIsAddBlacklistModalOpen}
                        isAlreadyInOtherAclModalOpen={isAlreadyInWhitelist}
                        setIsAlreadyInOtherAclModalOpen={
                            setIsAlreadyInWhitelist
                        }
                        handleOnConfirmReplace={
                            handleOnConfirmReplaceWhitelistToBlacklist
                        }
                    />
                    <RetrievalAclView
                        type={'whitelist'}
                        modifiedAclList={modifiedWhitelist}
                        checked={modifiedCurrentBehavior}
                        isCurrentlyAppliedAcl={currentBehavior === true}
                        onCheckedChange={handleAclBehaviorChange}
                        handleChooseClientOrClientPeerId={
                            handleChooseClientOrClientPeerIdWhitelist
                        }
                        handleValueNotInClientList={
                            handleValueNotInClientListWhitelist
                        }
                        clients={clients}
                        clientsForSelection={clientsForSelectionWhitelist}
                        selectedPeerOrClientId={selectedPeerOrClientIdWhitelist}
                        isAddFormDisabled={hasErrorAddWhitelistForm}
                        errorExplanationSelectedElem={
                            errorExplanationSelectedElemWhitelist
                        }
                        comment={commentWhitelist}
                        handleOnChangeComment={handleOnChangeCommentWhitelist}
                        handleOnAddToAcl={handleOnAddToWhitelist}
                        handleOnDeleteFromAcl={handleOnDeleteFromWhitelist}
                        isModalFormOpen={isAddWhitelistModalOpen}
                        setIsModalFormOpen={setIsAddWhitelistModalOpen}
                        isAlreadyInOtherAclModalOpen={isAlreadyInBlacklist}
                        setIsAlreadyInOtherAclModalOpen={
                            setIsAlreadyInBlacklist
                        }
                        handleOnConfirmReplace={
                            handleOnConfirmReplaceBlacklistToWhitelist
                        }
                    />
                    <div className="mt-3 p-2 align-self-end">
                        <button
                            className={'btn btn-primary custom-cidg-button'}
                            style={{ textAlign: 'center' }}
                            onClick={handleOnApply}
                            disabled={isAclUnmodified(
                                addedWhitelist,
                                removedWhitelist,
                                addedBlacklist,
                                removedBlacklist,
                                modifiedCurrentBehavior,
                                currentBehavior
                            )}
                        >
                            <div className="d-flex flex-row justify-content-center align-items-center">
                                {t('button.apply', {
                                    count: getAmountChanges(
                                        addedWhitelist,
                                        removedWhitelist,
                                        addedBlacklist,
                                        removedBlacklist,
                                        modifiedCurrentBehavior,
                                        currentBehavior
                                    ),
                                })}
                            </div>
                        </button>
                    </div>
                    <RetrievalAclEmptyWhitelist
                        isOpen={isEmptyWhitelistModalOpen}
                        setIsOpen={setIsEmptyWhitelistModalOpen}
                        isLoading={isApplyLoading}
                        onConfirm={async () => {
                            try {
                                await doApply()
                                setIsEmptyWhitelistModalOpen(false)
                            } catch (e) {
                                toast.error(t('notification.error.onApplyAcl'))
                                console.log(
                                    t('notification.error.onApplyAcl'),
                                    e
                                )
                            }
                        }}
                        amountChanges={getAmountChanges(
                            addedWhitelist,
                            removedWhitelist,
                            addedBlacklist,
                            removedBlacklist,
                            modifiedCurrentBehavior,
                            currentBehavior
                        )}
                    />
                    <RetrievalAclApply
                        isOpen={isApplyModalOpen}
                        setIsOpen={setIsApplyModalOpen}
                        isLoading={isApplyLoading}
                        onConfirm={async () => {
                            try {
                                await doApply()
                                setIsApplyModalOpen(false)
                            } catch (e) {
                                toast.error(t('notification.error.onApplyAcl'))
                                console.log(
                                    t('notification.error.onApplyAcl'),
                                    e
                                )
                            }
                        }}
                        amountChanges={getAmountChanges(
                            addedWhitelist,
                            removedWhitelist,
                            addedBlacklist,
                            removedBlacklist,
                            modifiedCurrentBehavior,
                            currentBehavior
                        )}
                    />
                </div>
            </>
        )
    }

    return (
        <div className="container">
            <Row className="mt-4">
                <Col xs={12} md={12}>
                    <h1>{t('title')}</h1>
                    <p>{t('subtitle')}</p>
                </Col>
            </Row>
            <Prompt
                when={
                    !isAclUnmodified(
                        addedWhitelist,
                        removedWhitelist,
                        addedBlacklist,
                        removedBlacklist,
                        modifiedCurrentBehavior,
                        currentBehavior
                    )
                }
                message={t('prompt.onLeavingWithUnsavedChanges')}
            />
            {isError
                ? componentOnError()
                : isLoading
                ? componentOnLoading()
                : componentWhenLoaded()}
        </div>
    )
}
