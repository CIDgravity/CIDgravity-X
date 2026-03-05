import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Badge from 'react-bootstrap/Badge'
import { copyToClipboard } from 'shared/utils/copy-to-clipboard'
import { RetrievalAclAlreadyOtherList } from 'shared/modals'
import { RetrievalAclForm } from './RetrievalAclForm'
import { isClientAcl, isPeerIdAcl } from 'shared/utils/retrievalAclUtil'

import { Table } from 'antd'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'

// type is str 'whitelist' or 'blacklist'
export function RetrievalAclView({
    type,
    modifiedAclList,
    checked,
    isCurrentlyAppliedAcl,
    onCheckedChange,
    handleChooseClientOrClientPeerId,
    handleValueNotInClientList,
    clients,
    clientsForSelection,
    selectedPeerOrClientId,
    isAddFormDisabled,
    errorExplanationSelectedElem,
    comment,
    handleOnChangeComment,
    handleOnAddToAcl,
    handleOnDeleteFromAcl,
    isModalFormOpen,
    setIsModalFormOpen,
    isAlreadyInOtherAclModalOpen,
    setIsAlreadyInOtherAclModalOpen,
    handleOnConfirmReplace,
}) {
    const { t } = useTranslation('RetrievalAclView') // second param ignored i18n

    const displayPeerIdShortFormat = (peerId) => {
        if (peerId.length > 15) {
            return (
                peerId.substring(0, 5) +
                ' [...] ' +
                peerId.substring(peerId.length - 5, peerId.length)
            )
        } else {
            return peerId
        }
    }

    const isAclEntryNew = (aclEntry) => {
        return aclEntry.id === undefined
    }

    const columns = [
        {
            title: t(`${type}.table.peerId.title`),
            width: 250,
            render: (_, aclEntry) =>
                isPeerIdAcl(aclEntry) ? (
                    <>
                        <span
                            data-tooltip-id="showEntirePeerId"
                            data-tooltip-content={aclEntry.peerId}
                        >
                            {displayPeerIdShortFormat(aclEntry.peerId)}
                        </span>

                        <Tooltip place="right" id="showEntirePeerId" />

                        <span onClick={() => copyToClipboard(aclEntry.peerId)}>
                            <i
                                className="ms-4 fas fa-copy fa-sm copy-btn"
                                data-tooltip-id="copyPeerIdToClipboard"
                                data-tooltip-content="Copy full Peer ID"
                            />

                            <Tooltip
                                place="bottom"
                                id="copyPeerIdToClipboard"
                            />
                        </span>
                    </>
                ) : (
                    <>
                        <span
                            data-tooltip-id="displayAllPeerIds"
                            data-tooltip-html={aclEntry.client?.peerIds.join('<br />')}
                        >
                            {aclEntry.client?.peerIds?.length === undefined ||
                            aclEntry.client?.peerIds?.length === null
                                ? t(`${type}.table.peerId.noContent`)
                                : t(`${type}.table.peerId.content`, {
                                      count: aclEntry.client?.peerIds?.length,
                                  })}

                            <Tooltip
                                place="right"
                                id="displayAllPeerIds"
                            />
                        </span>
                    </>
                ),
        },
        {
            title: t(`${type}.table.client.title`),
            width: 400,
            render: (_, aclEntry) => {
                if (isClientAcl(aclEntry)) {
                    return aclEntry.client.name
                }
                // eventually find client related to this peerId
                const clientThatHasThisPeerId = clients.find((client) =>
                    client.peerIds.includes(aclEntry.peerId)
                )
                if (clientThatHasThisPeerId !== undefined) {
                    // a matching client has been found!
                    return clientThatHasThisPeerId.name
                } else {
                    // no exising client matches this Peer ID
                    return '-'
                }
            },
        },
        {
            title: t(`${type}.table.comment.title`),
            render: (_, aclEntry) => (
                <>
                    <span
                        data-tooltip-id={
                            aclEntry.comment.length > 50
                                ? 'displayEntireComment'
                                : ''
                        }
                        data-tooltip-html={aclEntry.comment.replace(
                            /.{30}/g,
                            '$&<br />'
                        )}
                    >
                        {aclEntry.comment.length > 50
                            ? aclEntry.comment.substring(0, 50) + ' [...]'
                            : aclEntry.comment}

                        <Tooltip
                            place="bottom"
                            id="displayEntireComment"
                        />
                    </span>
                </>
            ),
        },
        {
            title: t(`${type}.table.action.title`),
            width: 56,
            render: (_, aclEntry) => (
                <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleOnDeleteFromAcl(aclEntry)}
                >
                    <FontAwesomeIcon icon={faXmark} size="2xs" />
                </button>
            ),
        },
    ]

    return (
        <>
            <div id={`${type}-container`} className="d-flex flex-row">
                <div
                    id={`${type}-container-text`}
                    className="d-flex flex-column justify-content-center"
                    style={{ width: '100%' }}
                >
                    <div className="p-2 d-flex align-items-center form-check">
                        <input
                            className="form-check-input"
                            checked={checked}
                            onChange={onCheckedChange}
                            type="radio"
                            name={`${type}-radio`}
                            id={`${type}-radio`}
                        ></input>
                        <label
                            className="form-check-label"
                            id={`${type}-radio-label`}
                            htmlFor={`${type}-radio`}
                        >
                            {t(`${type}.title`)}
                        </label>
                        {isCurrentlyAppliedAcl ? (
                            <div className="p-2">
                                <Badge variant="success">Active</Badge>
                            </div>
                        ) : null}
                    </div>
                    <div className="p-2">
                        <p>{t(`${type}.subtitle`)}</p>
                    </div>
                    <div
                        id={`${type}-container-chooser`}
                        className="pt-2 ps-2 pe-2"
                        style={{ width: '100%' }}
                    >
                        <section className="card-form">
                            <Table
                                columns={columns}
                                dataSource={modifiedAclList}
                                rowKey={(record) => record.id ?? record.peerId ?? record.client?.name}
                                locale={{ emptyText: t(`${type}.table.empty`) }}
                                rowClassName={(record) => isAclEntryNew(record) ? 'fst-italic' : ''}
                                pagination={{ pageSize: 10, hideOnSinglePage: true }}
                                size="small"
                            />
                        </section>
                    </div>
                    <div className="pe-2 ps-2 pb-2 align-self-end">
                        <button
                            className={'btn btn-success'}
                            onClick={() => setIsModalFormOpen(true)}
                        >
                            <FontAwesomeIcon icon={faPlus} size="lg" />
                        </button>
                    </div>
                </div>
                <RetrievalAclForm
                    type={type}
                    handleChooseClientOrClientPeerId={
                        handleChooseClientOrClientPeerId
                    }
                    handleValueNotInClientList={handleValueNotInClientList}
                    clientOrClientPeerIds={clientsForSelection}
                    selectedPeerOrClientId={selectedPeerOrClientId}
                    handleOnAddToAcl={handleOnAddToAcl}
                    comment={comment}
                    handleOnChangeComment={handleOnChangeComment}
                    disabled={isAddFormDisabled}
                    errorExplanationSelectedElem={errorExplanationSelectedElem}
                    show={isModalFormOpen}
                    setIsOpen={setIsModalFormOpen}
                />
                <RetrievalAclAlreadyOtherList
                    type={type}
                    show={isAlreadyInOtherAclModalOpen}
                    setIsOpen={setIsAlreadyInOtherAclModalOpen}
                    onConfirm={handleOnConfirmReplace}
                    selectedPeerOrClientId={selectedPeerOrClientId}
                />
            </div>
        </>
    )
}
