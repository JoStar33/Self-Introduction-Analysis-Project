//LabelView내에서 해당 변수나 함수들을 재정의!! 즉 이녀석이 LabelView인 셈이다.
export abstract class TopContextUser {
    readonly left!: number;
    readonly width!: number;
    layer: number = 0;
    abstract render(): SVGElement;
    abstract update(): void;
}

//겹치는 부분에대해 어떻게할건지 도움을 주는 함수.
export function overLaps(user1: TopContextUser, user2: TopContextUser): boolean {
    if (user1.layer !== user2.layer) {
        return false;
    } else if (user1.left > user2.left) {
        return overLaps(user2, user1);
    } else if (user1.left + user1.width < user2.left) {
        return false;
    }
    return true;
}
