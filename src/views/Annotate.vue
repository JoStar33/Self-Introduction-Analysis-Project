<template>
    <v-container>
        <v-row no-gutters="no-gutters">
            <div id = "Content_Select_Btn"></div>
            <div id = "div_Select_Label_Category">
                <select id = "Select_Label_Category"></select>
            </div>
            <div class="container_of_LabelProject" id="container-first" ref="container"></div>
            <v-dialog
                max-width="290"
                persistent="persistent"
                v-model="showLabelCategoriesDialog">
                <v-card>
                    <v-card-title>
                        <span class="headline">라벨링</span>
                    </v-card-title>
                    <v-card-text>
                        <v-radio-group v-model="selectedLabelCategory">
                            <v-radio
                                :key="category.id"
                                :label="category.text"
                                :value="category.id"
                                v-for="category in this.labelCategories"
                                @change="clickLabelCategories = true"></v-radio>
                        </v-radio-group>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click="addLabel" color="#4B89DC">
                            설정
                        </v-btn>
                        <v-btn @click="showLabelCategoriesDialog = false" color="#4B89DC">
                            취소
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
        <v-row align="end">
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
                return {
                    jsonData: null,
                    annotator: null as Annotator | null,
                    selectedLabelCategory: null as LabelCategory.Entity | null,
                    clickLabelCategories: false as boolean,
                    showLabelCategoriesDialog: false as boolean,
                    json: "",
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
                    Group_of_Question_Btn.style.width = "200%"
                    for(let i = 0; i < questionJson.questionData.length; ++i){
                        var Question_Btn = document.createElement("button");
                        Question_Btn.textContent = questionJson.questionData[i].question;
                        Question_Btn.className = "Question_Btn";
                        Question_Btn.id = "Btn_No"+ i;
                        Question_Btn.addEventListener("click", function(){
                            _this.annotator.remove();
                            _this.annotator = _this.updateQuestionClickAnnotator(i);
                            _this.updateJSON();
                        });
                        Group_of_Question_Btn.appendChild(Question_Btn);
                        if(i === 4){
                            document.getElementById("Content_Select_Btn").appendChild(Group_of_Question_Btn);
                            Group_of_Question_Btn = document.createElement("div");
                        } 
                    }
                    document.getElementById("Content_Select_Btn").appendChild(Group_of_Question_Btn);
                },
                makeSelectLabelCategory(){
                    var _this = this;
                    for(let i = 0; i < _this.jsonData.labelCategories.length; ++i){
                        var Box_LabelCategory = document.createElement("option");
                        Box_LabelCategory.textContent = _this.jsonData.labelCategories[i].text;
                        Box_LabelCategory.value = _this.jsonData.labelCategories[i].id;
                        document.getElementById("Select_Label_Category").appendChild(Box_LabelCategory);
                    }
                    document.getElementById("Select_Label_Category").addEventListener("change", function(){
                        //이를 대체 어찌한단 말인가....
                        _this.annotator.remove();
                        _this.annotator = _this.updateAnnotator();
                        _this.updateJSON();
                    });
                },
                /*
                upload(e) {document
                    let reader = new FileReader();
                    reader.readAsText(e.target.files[0]);
                    reader.onload = (event) => {
                        window.setTimeout(() => {
                            this.jsonData = JSON.parse(event.target.result.toString())
                            if (this.annotator !== null) {
                                this
                                    .annotator
                                    .remove();
                            }
                            if (this.jsonData !== null && this.jsonData.content) {
                                this.annotator = this.createAnnotator();
                                this.updateJSON();
                            }
                            this
                                .$eventbus
                                .$emit("fileUploaded", JSON.parse(event.target.result.toString()));
                            this.$forceUpdate();
                        }, 10);
                    };
                    this
                        .$router
                        .push("annotate")
                        .catch(_ => {});
                },
                */
                updateJSON(): void {
                    for (var i = 0; i < defaultData.introductions.length; ++i) {
                        if(defaultData.introductions[i].id === this.annotator.store.json.id){
                            defaultData.introductions[i] = this.annotator.store.json
                        }
                    }
                    JSON.stringify(defaultData, null, 4)
                    this.json = this.highlight(JSON.stringify(defaultData, null, 4));
                },
                addLabel(): void {
                    if (this.categorySelectMode === CategorySelectMode.Update && this.clickLabelCategories) {
                        this
                            .annotator
                            .applyAction(Action.Label.Update(this.selectedId, this.selectedLabelCategory));
                            this.updateJSON();
                    } else if(this.clickLabelCategories){
                        this.annotator
                        .applyAction(
                            Action.Label.Create(this.selectedLabelCategory, this.startIndex, this.endIndex)
                        );
                        this.updateJSON();
                    }
                    this.showLabelCategoriesDialog = false;
                    this.clickLabelCategories  = false;
                },
                updateQuestionClickAnnotator(point){
                    this.jsonData = defaultData.introductions[point];
                    //카테고리 값을 가지고온다.
                    this.jsonData.labelCategories = defaultData.labelCategories;
                    const annotator = new Annotator(this.jsonData, this.$refs.container);
                    annotator.on("textSelected", (startIndex, endIndex) => {
                        this.startIndex = startIndex;
                        this.endIndex = endIndex;
                        this.categorySelectMode = CategorySelectMode.Create;
                        this.showLabelCategoriesDialog = true;
                    });

                    annotator.on("buttonClicked", (labelId, event : MouseEvent) => {
                        if (event.ctrlKey) {
                            this.categorySelectMode = CategorySelectMode.Update;
                            this.selectedId = labelId;
                            this.showLabelCategoriesDialog = true;
                        } else {
                            annotator.applyAction(Action.Label.Delete(labelId));
                        }
                        this.updateJSON();
                    });

                    annotator.on("contentInput", (position, value) => {
                        annotator.applyAction(Action.Content.Splice(position, 0, value));
                        this.updateJSON();
                    });
                    annotator.on("contentDelete", (position, length) => {
                        annotator.applyAction(Action.Content.Splice(position, length, ""));
                        this.updateJSON();
                    });
                    return annotator;   
                },
                //this.annotator.store.json
                
                updateAnnotator(): Annotator {
                    const annotator = new Annotator(this.annotator.store.json, this.$refs.container);
                    annotator.on("textSelected", (startIndex, endIndex) => {
                        this.startIndex = startIndex;
                        this.endIndex = endIndex;
                        this.categorySelectMode = CategorySelectMode.Create;
                        this.showLabelCategoriesDialog = true;
                    });

                    annotator.on("buttonClicked", (labelId, event : MouseEvent) => {
                        if (event.ctrlKey) {
                            this.categorySelectMode = CategorySelectMode.Update;
                            this.selectedId = labelId;
                            this.showLabelCategoriesDialog = true;
                        } else {
                            annotator.applyAction(Action.Label.Delete(labelId));
                        }
                        this.updateJSON();
                    });

                    annotator.on("contentInput", (position, value) => {
                        annotator.applyAction(Action.Content.Splice(position, 0, value));
                        this.updateJSON();
                    });
                    annotator.on("contentDelete", (position, length) => {
                        annotator.applyAction(Action.Content.Splice(position, length, ""));
                        this.updateJSON();
                    });
                    return annotator;
                },

                createAnnotator(): Annotator {
                    const annotator = new Annotator(this.jsonData, this.$refs.container);
                    annotator.on("textSelected", (startIndex, endIndex) => {
                        this.startIndex = startIndex;
                        this.endIndex = endIndex;
                        this.categorySelectMode = CategorySelectMode.Create;
                        this.showLabelCategoriesDialog = true;
                    });

                    annotator.on("buttonClicked", (labelId, event : MouseEvent) => {
                        if (event.ctrlKey) {
                            this.categorySelectMode = CategorySelectMode.Update;
                            this.selectedId = labelId;
                            this.showLabelCategoriesDialog = true;
                        } else {
                            annotator.applyAction(Action.Label.Delete(labelId));
                        }
                        this.updateJSON();
                    });

                    annotator.on("contentInput", (position, value) => {
                        annotator.applyAction(Action.Content.Splice(position, 0, value));
                        this.updateJSON();
                    });
                    annotator.on("contentDelete", (position, length) => {
                        annotator.applyAction(Action.Content.Splice(position, length, ""));
                        this.updateJSON();
                    });
                    return annotator;
                },

                highlight(code : string): string {
                    return Prism.highlight(code, Prism.languages.javascript, "javascript");
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
                    this.annotator = this.createAnnotator();
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
                this.makeSelectLabelCategory();
                let _this = this;
                if (this.jsonData !== null && this.jsonData.content) {
                    this.annotator = this.createAnnotator();
                    this.updateJSON();
                }
                window.addEventListener("resize", function(){    
                    _this.annotator.remove();
                    _this.annotator = _this.updateAnnotator();
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
    #div_Select_Label_Category{
        display: inline-block;
        margin-top: 10%;
    }

    #Select_Label_Category{
        border: 1px solid black;
    }

    .Question_Btn{
        text-align: center;
        width: 25%;
        height: 50px;
        float: left;
        margin-left: 2%;
        margin-bottom: 2%;
        border: 1px solid black;
        /*background-color: #d5d5f1;*/
        border-radius: 5%;
    }

    #Content_Select_Btn {
        transform: translateX(14%);
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