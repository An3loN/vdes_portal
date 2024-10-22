export const formatDate = (unixTime: string) => {
    const date = new Date(Number(unixTime) * 1000);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Europe/Moscow',
    }) + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow',});
};

export const unixToInput = (unixTime: string) => {
    const date = new Date(Number(unixTime) * 1000 - (new Date()).getTimezoneOffset() * 60000);
    let input_date = date.toISOString();
    return input_date.substring(0, input_date.lastIndexOf(':'));
};

export const inputToUnix = (inputDate: string) => {
    return Math.floor(new Date(inputDate).getTime() / 1000);
}

export const unixTimePassed = (unixTime: string) => {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= Number(unixTime);
}