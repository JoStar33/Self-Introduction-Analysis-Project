<template>
    <v-container>
        <v-row no-gutters="no-gutters">
            <div id = "Content_Select_Btn"></div>
            <div id = "div_SelectBox">
                <select id = "Select_Label_Category">
                    <option value = "-1">전체보기</option>
                </select>
            </div>
            <div id = "guide_Labelproject">
                <p>#마음에 드는 문장을 드래그 해주세요!</p>
            </div>
            <div class = "container_of_LabelProject" id="container-first" ref="container"></div>
        </v-row>
        <v-row align = "end">
            <v-btn @click="download" color="#4B89DC">
                <v-icon left="left">mdi-cloud-download</v-icon>
                {{ $t("download") + "JSON" }}
            </v-btn>
        </v-row>
    </v-container>
</template>

<script lang="ts">
        import Vue from "vue";
        import Prism from "prismjs";
        import {Annotator, Action} from "../index";
        import {LabelCategory} from "../Store/LabelCategory";
        import defaultData from "../assets/default.json";
        import questionJson from "../assets/question.json";

        enum CategorySelectMode {
            Create,
            Update
        }
        export default Vue.extend({
            components: {},
            data() {
                return{
                    testJsonData: null,
                    jsonData: null,
                    json: "",
                    annotator: null as Annotator | null,
                    selectedLabelCategory: null as LabelCategory.Entity | null,
                    clickLabelCategories: true as boolean,
                    showLabelCategoriesDialog: false as boolean,
                    selectBoxMode: false as boolean,
                    currentState: 0,
                    startIndex: -1,
                    endIndex: -1,
                    first: -1,
                    second: -1,
                    categorySelectMode: CategorySelectMode.Create,
                    selectedId: -1
                };
            },
            methods: {
                makeContentSelectBtn(){
                    var _this = this;
                    var Group_of_Question_Btn = document.createElement("div");
                    //Group_of_Question_Btn.style.width = "200%"
                    for(const QJsonData of questionJson.questionData){
                        var Question_Btn = document.createElement("button");
                        Question_Btn.textContent = QJsonData.question;
                        Question_Btn.className = "Question_Btn";
                        Question_Btn.id = "Btn_No"+ QJsonData.id;
                        Question_Btn.addEventListener("click", function(){
                            _this.currentState = QJsonData.id;
                            _this.selectBoxMode = false;
                            _this.annotator.remove();
                            _this.annotator = _this.updateAnnotator(2 ,QJsonData.id);
                            _this.updateJSON();
                        });
                        Group_of_Question_Btn.appendChild(Question_Btn);
                        if(QJsonData.id === 3){
                            document.getElementById("Content_Select_Btn").appendChild(Group_of_Question_Btn);
                            Group_of_Question_Btn = document.createElement("div");
                        } 
                    }
                    document.getElementById("Content_Select_Btn").appendChild(Group_of_Question_Btn);
                },

                makeSelectBoxOptions(){
                    var _this = this;
                    for(let selectBoxOption of _this.jsonData.labelCategories){
                        var Box_LabelCategory = document.createElement("option");
                        Box_LabelCategory.textContent ="평가자 " + selectBoxOption.text;
                        Box_LabelCategory.value = String(selectBoxOption.id);
                        document.getElementById("Select_Label_Category").appendChild(Box_LabelCategory);
                    }
                    const selectedOption = document.getElementsByTagName("select")[0];

                    selectedOption.addEventListener("change", function(){
                        _this.annotator.remove();
                        _this.annotator = _this.updateAnnotator(3, parseInt(selectedOption.value)); //update Annotator SelectBox Option click Mode use.
                    });
                },

                pushLabel_When_SelectMode(Intro: any, IntroPoint: number): void {
                    for (let newAddLabels of Intro.labels) {
                        let checkpoint = false;
                        for(let it of defaultData.introductions[IntroPoint].labels){
                            if(it.id === newAddLabels.id && it.startIndex === newAddLabels.startIndex && it.endIndex === newAddLabels.endIndex){
                                checkpoint = true;
                            }
                        }
                        if(checkpoint === false){
                            defaultData.introductions[IntroPoint].labels.push(newAddLabels);
                        }
                    }
                },

                updateJSON(): void {
                    if(this.selectBoxMode){
                        for (var i = 0; i < defaultData.introductions.length; ++i) {
                            if(defaultData.introductions[i].id === this.annotator.store.json.id){
                                let currentAnnotator = this.annotator.store.json;
                                this.pushLabel_When_SelectMode(currentAnnotator, i);
                                break;
                            }
                        }
                    }
                    else{
                        for (var i = 0; i < defaultData.introductions.length; ++i) {
                            if(defaultData.introductions[i].id === this.annotator.store.json.id){
                                defaultData.introductions[i] = this.annotator.store.json;
                                break;
                            }
                        }
                    }
                    JSON.stringify(defaultData, null);
                    this.json = this.highlight(JSON.stringify(defaultData, null, 4));
                },

                updateJSON_for_SelectMode_LabelDelete(deleteLabelID: number): void{
                    for (let i = 0; i < defaultData.introductions.length; ++i) {
                        if(defaultData.introductions[i].id === this.annotator.store.json.id){ 
                            defaultData.introductions[i].labels = defaultData.introductions[i].labels.filter(it => it.id !== deleteLabelID);
                            break;
                        }
                    }
                    JSON.stringify(defaultData, null, 4);
                    this.json = this.highlight(JSON.stringify(defaultData, null, 4));
                },

                //this.annotator.store.json
                updateAnnotator(Mode: number, point: number): Annotator {
                    //Mode = 0 : create Annotator
                    //Mode = 1 : normal update
                    //Mode = 2 : Question Button Click. So, Show another Contents
                    //Mode = 3 : Select Box Option Click. Show labels for options 
                    let annotator: Annotator;
                    if(Mode === 0){
                        annotator = new Annotator(this.jsonData, this.$refs.container);
                    }
                    else if(Mode === 1){
                        annotator = new Annotator(this.annotator.store.json, this.$refs.container);
                    }
                    else if(Mode === 2){
                        this.jsonData = defaultData.introductions[point];
                        this.jsonData.labelCategories = defaultData.labelCategories;
                        annotator = new Annotator(defaultData.introductions[point], this.$refs.container);
                    }
                    else if(Mode === 3){
                        if(point !== -1){
                            this.selectBoxMode = true;
                            let FindLabels = defaultData.introductions[this.currentState].labels.filter(element => element.categoryId !== point);
                            annotator = new Annotator(defaultData.introductions[this.currentState], this.$refs.container);
                            for(let deleteAction of FindLabels){
                                annotator.applyAction(Action.Label.Delete(deleteAction.id));
                            }
                        }
                        else{
                            this.selectBoxMode = false;
                            annotator = new Annotator(defaultData.introductions[this.currentState], this.$refs.container);
                        }
                    }
                    this.settingEvent(annotator);
                    return annotator;
                },

                highlight(code : string): string {
                    return Prism.highlight(code, Prism.languages.javascript, "javascript");
                },

                settingEvent(annotator: Annotator): void{
                    annotator.on("textSelected", (startIndex, endIndex) => {
                        this.startIndex = startIndex;
                        this.endIndex = endIndex;
                        this.categorySelectMode = CategorySelectMode.Create;
                        this.addLabel();
                    });

                    annotator.on("buttonClicked", (labelId, event : MouseEvent) => {
                        if (event.ctrlKey) {
                            this.categorySelectMode = CategorySelectMode.Update;
                            this.selectedId = labelId;
                            this.addLabel();
                        } else {
                            annotator.applyAction(Action.Label.Delete(labelId));
                        }
                        this.updateJSON_for_SelectMode_LabelDelete(labelId);
                    });

                    annotator.on("contentInput", (position, value) => {
                        annotator.applyAction(Action.Content.Splice(position, 0, value));
                    });

                    annotator.on("contentDelete", (position, length) => {
                        annotator.applyAction(Action.Content.Splice(position, length, ""));
                    });
                },

                addLabel(): void {
                    if (this.categorySelectMode === CategorySelectMode.Update && this.clickLabelCategories) {
                        this
                            .annotator
                            .applyAction(Action.Label.Update(this.selectedId, defaultData.userInformation[0].id));
                            this.updateJSON();
                    } else if(this.clickLabelCategories){
                        this.annotator
                        .applyAction(
                            Action.Label.Create(defaultData.userInformation[0].id, this.startIndex, this.endIndex)
                        );
                        this.updateJSON();
                    }
                    this.showLabelCategoriesDialog = false;
                    this.clickLabelCategories = true;
                },

                download: function () {
                    const eleLink = document.createElement("a");
                    eleLink.download = "data.json";
                    eleLink.style.display = "none";
                    const blob = new Blob([JSON.stringify(defaultData, null, 4)]);
                    eleLink.href = URL.createObjectURL(blob);
                    document
                        .body
                        .appendChild(eleLink);
                    eleLink.click();
                    document
                        .body
                        .removeChild(eleLink);
                }
            },
            computed: {
                labelCategories(): LabelCategory.Entity[]{
                    if (this.annotator === null) {
                        return [];
                    }
                    const result = [];
                    for (const [_, category] of this.annotator.store.labelCategoryRepo) {
                        result.push(category);
                    }
                    return result;
                }
            },
            created(): void {
                this.jsonData = defaultData.introductions[0];
                //카테고리 값을 가지고온다.
                this.jsonData.labelCategories = defaultData.labelCategories;
                if (this.annotator !== null) {
                    this
                        .annotator
                        .remove();
                }
                if (this.jsonData !== null && this.jsonData.content) {
                    this.annotator = this.updateAnnotator(0, 0);
                    this.updateJSON();
                }
                this
                    .$eventbus
                    .$on("downloadRequest", () => {
                        this.download();
                    });
                this
                    .$router
                    .push("annotate")
                    .catch(_ => {});
            },
            mounted(): void {
                this.makeContentSelectBtn();
                this.makeSelectBoxOptions();
                let _this = this;
                if (this.jsonData !== null && this.jsonData.content) {
                    this.annotator = this.updateAnnotator(0, 0);
                    this.updateJSON();
                }
                window.addEventListener("resize", function(){    
                    _this.annotator.remove();
                    _this.annotator = _this.updateAnnotator(1, 0);
                    _this.updateJSON();
                });
            }
        });
</script>
<style scoped="scoped">
    .container-wrapper {
        border-right: solid 2px black;
    }
</style>
<style>

    #guide_Labelproject{
        background-color: #d5f1dc;
        margin-bottom: 13px;
        box-shadow: 10px 10px 10px gray;
        margin-top: 3px;
        border-radius: 30px;
        width: 80%;
    }
    
    #guide_Labelproject > p {
            text-align: center;
            font-style: inherit;
            font-size: 15px;
            font-weight: 700;
    }

    .no-gutters{
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    #Select_Label_Category{
        border: 1px solid black;
    }

    .Question_Btn{
        text-align: center;
        width: 35%;
        height: 50px;
        float: left;
        margin-left: 8%;
        margin-bottom: 2%;
        border: 1px solid black;
        /*background-color: #d5d5f1;*/
        border-radius: 5%;
    }

    #Content_Select_Btn {
        height: 50%;
    }

    .container_of_LabelProject > svg {
        display: block;
        pointer-events: none;
        width: 100%;
        height: 100%;
        /*background-clip: padding-box;*/
    }

    .container_of_LabelProject > g {
        pointer-events: all !important;
    }

    div.container_of_LabelProject {
        position: relative;
        overflow-y: scroll;
        overflow-x: hidden;
        /*display: flex;*/
        width: 100%;
        height: 400px;
    }

    tspan {
        pointer-events: auto;
    }

    .poplar-annotation-label {
        font-size: 14px;
        font-family: Verdana, serif;
    }

    path {
        cursor: pointer !important;
        pointer-events: all;
    }
    .upload {
        position: absolute;
        width: 85px;
        height: 37px;
        opacity: 0;
        cursor: pointer;
    }
</style>
