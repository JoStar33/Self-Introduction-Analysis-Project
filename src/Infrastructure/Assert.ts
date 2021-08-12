declare let process: any;

export function assert(condition: boolean, message?: string) {
    if (process.env.NODE_ENV === 'development') { //개발모드이냐 아니냐를 확인해준다.
        if (condition === false) {
            throw Error('Assertion failed' + (message === undefined) ? (':' + message) : '')
        }
    }
}
