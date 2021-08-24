<template app = "app">
    <v-container>
        <div class = "top-Part" id = "devide-Part">
            <img src = "./assets/Mac.jpg">
            <InfoApplicant id = "Introduce-Part"></InfoApplicant>
        </div>
        <div class = "left-Part" id = "devide-Part">
            <div class = "Title">
                <p>
                    경력 생애 주기
                </p>
            </div>
            <div id="TimelineBox">
                <TimeLine></TimeLine>
            </div>
        </div>
        <div class = "right-Part" id="devide-Part">
            <div class = "Title">
                <p>
                    자기소개서 키워드
                </p>
            </div>
            <KeywordsApplication></KeywordsApplication>
            <div class = "Title">
                <p>
                    지원자 자기소개서
                </p>
            </div>
            <Annotate class = "LabelProject"></Annotate>
        </div>
    </v-container>
</template>

    <script lang="ts">
        import Vue from "vue";
        import Annotate from "@/views/Annotate.vue";
        import TimeLine from "@/views/TimeLine.vue";
        import InfoApplicant from "@/views/PersonalInfo.vue";
        import KeywordsApplication from "@/views/KeywordsApplication.vue";

        export default Vue.extend({
            components: {
                TimeLine,
                Annotate,
                InfoApplicant,
                KeywordsApplication
            },
            mounted() {
                this.handleResize();
                window.addEventListener('resize', this.handleResize);
            },
            methods: {
                handleResize() {
                    this.windowWidth = window.innerWidth;
                    if(this.windowWidth < 850){
                        document.getElementById("Timeline").style.transform = "scale(0.35)";
                        document.getElementById("Timeline").style.transformOrigin = "3% center";
                        document.getElementById("TimelineBox").style.overflowX = "scroll";
                        document.getElementById("TimelineBox").style.height = "130px";
                        document.getElementById("TimelineBox").style.marginBottom = "2%";
                    }
                    else if(this.windowWidth < 950){
                        document.getElementById("Timeline").style.transform = "scale(0.40)";
                        document.getElementById("Timeline").style.transformOrigin = "5% center";
                        document.getElementById("TimelineBox").style.overflowX = "hidden";
                        document.getElementById("TimelineBox").style.height = "130px";
                        document.getElementById("TimelineBox").style.marginBottom = "2%";
                    }
                    else if(950 <= this.windowWidth && this.windowWidth <= 1263){
                        document.getElementById("Timeline").style.transform = "scale(0.45)";
                        document.getElementById("Timeline").style.transformOrigin = "5% center";
                        document.getElementById("TimelineBox").style.overflowX = "hidden";
                        document.getElementById("TimelineBox").style.height = "130px";
                        document.getElementById("TimelineBox").style.marginBottom = "2%";
                    }
                    else if(1263 < this.windowWidth && this.windowWidth < 1904){
                        document.getElementById("Timeline").style.transform = "scale(0.62)";
                        document.getElementById("Timeline").style.transformOrigin = "5% center";
                        document.getElementById("TimelineBox").style.overflowX = "hidden";
                        document.getElementById("TimelineBox").style.height = "130px";
                        document.getElementById("TimelineBox").style.marginBottom = "2%";
                    }
                    else{
                        document.getElementById("Timeline").style.transform = "scale(0.97)";
                        document.getElementById("Timeline").style.transformOrigin = "5% center";
                        document.getElementById("TimelineBox").style.overflowX = "hidden";
                        document.getElementById("TimelineBox").style.height = "200px";
                        document.getElementById("TimelineBox").style.marginBottom = "0%";
                        document.getElementById("TimelineBox").style.marginTop = "1%";
                    }
                },

                beforeDestroy() {
                    window.removeEventListener('resize', this.handleResize);
                }
            }
        });
    </script>

    <style>
        body {
            min-width: 620px !important;
        }
        .LabelProject {
            /*width: 48vw !important;*/
            width: 96%;
        }
        #devide-Part {
            border-style: dotted;
            border-color: black;
            border-radius: 10px;
            border: 0.5;
        }
        #Introduce-Part {
            display: left;
        }
        .top-Part > img {
            float: left;
            width: 150px;
            height: 100%;
            border-radius: 30px;
            margin: 3px;
            padding-bottom: 6px;
        }
        .top-Part {
            width: 100%;
            height: 150px;
            margin-bottom: 50px;
        }
        .left-Part {
            width: 49.8%;
            display: inline-block;
            box-sizing: border-box;
        }
        .right-Part {
            width: 49.8%;
            float: right;
            box-sizing: border-box;
        }
        div#TimelineBox {
            width: 96%;
            float: left;
            height: 130px;
            box-sizing: border-box;
            overflow-x: hidden;
            overflow-y: hidden;
            margin-left: 2%;
            margin-bottom: 2%;
            margin-top: -2%;
        }
        .Title {
            width: 96%;
            background-color: #d5d5f1;
            margin-top: 3px;
            border-radius: 30px;
            margin-bottom: 13px;
            margin-left: 2%;
            box-shadow: 10px 10px 10px gray;
            overflow-y: hidden;
        }
        .Title > p {
            text-align: center;
            font-style: inherit;
            font-size: 15px;
            font-weight: 700;
        }
    </style>