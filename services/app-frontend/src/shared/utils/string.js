export const generateRandomString = (length) => {
    return Math.random().toString(20).substr(2, length)
}

export const trimString = (str) => {
    if (str.length > 15) {
        return (
            str.substring(0, 5) +
            ' [...] ' +
            str.substring(str.length - 5, str.length)
        )
    } else {
        return str
    }
}

export function dashToCamelCase(str) {
    return str.split('-').map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)).join('');
}