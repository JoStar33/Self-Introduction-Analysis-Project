import {none, Option, some} from "./Option";

export function lookup<T>(array: Array<T>, index: number): Option<T> {
    if (array.length <= index) {
        return none;
    } else {
        return some(array[index]);
    }
}

export function takeWhile<T>(array: Array<T>, pred: (value: T) => boolean): Array<T> {
    let i: number;
    for (i = 0; i < array.length && pred(array[i]); ++i) {
    }
    //slice() 메서드는 어떤 배열의 begin부터 end까지(end 미포함)에 대한 얕은 복사본을 새로운 배열 객체로 반환합니다
    return array.slice(0, i);
}
