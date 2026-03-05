import React from 'react'
import Button from 'react-bootstrap/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faSpinner } from '@fortawesome/free-solid-svg-icons'

const CustomButtonPremium = ({ 
    btnTag = null, 
    btnId, 
    btnToLink = null, 
    btnHandleAction = null, 
    btnColor = "primary", 
    btnSize = "1x",
    btnClassName, 
    disabled = false, 
    isPremium = false, 
    isSubmitting = false,
    btnText = "Button"
}) => {
    return (
        <>
            {btnTag && btnToLink ? (
                <Button as={btnTag} id={btnId} to={btnToLink} variant={btnColor} size={btnSize} className={btnClassName} disabled={disabled || !isPremium}>
                    {!isPremium && (
                        <FontAwesomeIcon icon={faLock} />
                    )}

                    <span className="p-2 as--light">
                        {btnText}
                    </span>
                </Button>

            ) : btnHandleAction ? (
                <Button onClick={btnHandleAction} id={btnId} variant={btnColor} size={btnSize} className={btnClassName} disabled={disabled || !isPremium}>
                    {!isPremium && (
                        <FontAwesomeIcon icon={faLock} />
                    )}

                    <span className="p-2 as--light">
                        {btnText}
                    </span>
                </Button>

            ) : (
                <Button btnType="submit" id={btnId} variant={btnColor} size={btnSize} className={btnClassName} disabled={disabled || !isPremium}>
                    {!isPremium && !isSubmitting && (
                        <FontAwesomeIcon icon={faLock} />
                    )}

                    {isSubmitting ? (
                        <FontAwesomeIcon spin icon={faSpinner} size="2xs" />
                    ) : (
                        <span className="p-2 as--light">
                            {btnText}
                        </span>
                    )}
                </Button>
            
            )}
        </>
    )
}

export default CustomButtonPremium