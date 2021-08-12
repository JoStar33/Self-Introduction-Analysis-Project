import {Line} from "../Line";
import {SVGNS} from "../../../../Infrastructure/SVGNS";
import {overLaps, TopContextUser} from "./TopContextUser";
import {assert} from "../../../../Infrastructure/Assert";
import {LabelView} from "../../LabelView/LabelView";

//각 라인당 가지는 라벨들의 그룹. 그게 바로 TopContext!
export class TopContext {
    public backgroundElement: SVGGElement = null as any;
    readonly belongTo: Line.ValueObject;
    //g태그라는점 유념.
    public svgElement: SVGGElement = null as any;


    //iterable : 한 번에 하나의 member를 반환할 수 있는 object (객체)를 의미
    //TopContextUser는 겹치는 하이라이팅들
    //children은 child들을 가지는 배열이라고 생각해도 좋을듯.
    readonly children = new Set<TopContextUser>();

    constructor(
        //이 라인에대한 그룹이라는걸 인지시켜주기 위해 Line.ValueObject를 넘겨받는다..
        belongTo: Line.ValueObject
    ) {
        this.belongTo = belongTo;
    }

    //children 요소중 가장 큰 녀석을 반환해준다.
    get layer(): number {
        return this.children.size === 0 ? 0 :
        //Array내부에 가장 큰 숫자를 반환한다.
        //it은 topcontextuser.즉 겹치는 하이라이팅
            Math.max(...Array.from(this.children).map(it => it.layer));
    }

    update() {
        //LabelView의 update를 진행. 즉, 위치를 변화시킨다.
        this.children.forEach(it => it.update());
        //filter는 콜백함수로 지정된 조건에 맞는 요소를 다시 반환한다.
        //instanceof는 it객체에 LabelView.Entity타입이 있냐 없냐를 확인
        Array.from(this.children)
            .filter(it => it instanceof LabelView.Entity)
            // @ts-ignore
    }

    render(): [SVGGElement, SVGGElement] {
        //g태그를 만들어주는 부분.
        this.svgElement = document.createElementNS(SVGNS, 'g') as SVGGElement;
        this.backgroundElement = document.createElementNS(SVGNS, 'g') as SVGGElement;
        this.children.forEach(it => {
            //children 내부에 요소들을 g태그 내부로 넣겠다 라는 의미.
            this.renderChild(it);
        });
        this.update();
        return [this.svgElement, this.backgroundElement];
    }

    addChild(child: TopContextUser): number {
        const oldLayer = this.layer;
        let hasOverlapping = false;
        do {
            ++child.layer;
            hasOverlapping = false;
            for (let otherEntity of this.children) {
                //child가 children 그룹에 속하나 안속하나를 검사.
                if (overLaps(child, otherEntity)) {
                    hasOverlapping = true;
                    break;
                }
            }
        } while (hasOverlapping);
        //해당그룹에 child(라벨)를 추가.
        this.children.add(child); //children 그룹에 추가한다.
        const newLayer = this.layer;
        return newLayer - oldLayer;
    }

    renderChild(child: TopContextUser) {
        assert(this.children.has(child));
        const childRenderResult = child.render(); //랜더링된 라벨의 결과물. 즉, LabelView의 render된 결과인셈.
        this.svgElement.appendChild(childRenderResult); //결과물을 g태그에 넣는다!
    }

    removeChild(child: TopContextUser) {
        assert(this.children.has(child));
        //children 즉, 그룹내에 child 객체를 제거한다.
        this.children.delete(child);
    }

    remove() {
        this.svgElement.remove();
        this.backgroundElement.remove();
    }
}
