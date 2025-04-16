import { toast } from 'react-toastify'

export const copyToClipboard = (message) => {
    let area = document.createElement('textarea')
    document.body.appendChild(area)
    area.value = message
    area.select()
    document.execCommand('copy')
    document.body.removeChild(area)
    toast.success('Copied to clipboard')
}
