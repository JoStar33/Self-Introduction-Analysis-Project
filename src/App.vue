<template>
     <v-container>
        <div class = "top" id="devide-Part">
            <img src="./assets/Mac.jpg">
            <!--이부분에 자기소개를 할 Vue를 넣어주면 오케이!-->
        </div>
        <div class="left" id="devide-Part">
            <div class="TimelineTitle">
                <p>
                    경력 생애 주기
                </p>
            </div>
            <div class="Timeline-left">
                 <TimeLine></TimeLine>
            </div>
        </div>
        <div class="right" id="devide-Part">
            <div class="TimelineTitle">
                <p>
                    지원자 자기소개서
                </p>
            </div>
            <Annotate class="LabelProject"></Annotate>
        </div>
    </v-container>
</template>

<script lang="ts">
    import Vue from "vue";
    import Annotate from "@/views/Annotate.vue";
    import TimeLine from "@/views/TimeLine.vue";

    export default Vue.extend({
        components: {
            TimeLine,
            Annotate
        }
    });
</script>




<style>
.LabelProject{
    /*width: 48vw !important;*/
    float: right;
}
div#devide-Part{
    border-style: solid;
    border-color: black;
    border: 0.5;
}
div.top{
    width: 100%;
    height: 150px;
    margin-bottom: 50px;
}
div.top > img{
    float: left;
    width: 150px;
    height: 100%;
    border-radius: 30px;
    margin: 3px;
    padding-bottom: 6px;
}
IntroduceMyself{ 
    float: left;
}
div.left{
    width: 49.8%;
    float: left;
    box-sizing: border-box;
}
div.Timeline-left {
    width: 100%;
    float: left;
    box-sizing: border-box;
    overflow-x: scroll;
}
div.right {
    width: 49.8%;
    float: right;
    box-sizing: border-box;
}
div.TimelineTitle {
    width: 96%;
    background-color: #d5d5f1;
    margin-top: 3px;
    border-radius: 30px;
    margin-bottom: 13px;
    margin-left: 2%;
    box-shadow: 10px 10px 10px gray;
    overflow-y: hidden;
}
div.TimelineTitle > p{
    text-align: center;
    font-style: inherit;
    font-size: 17px;
    font-weight: 700;
}
</style>>
