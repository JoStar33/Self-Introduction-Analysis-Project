<template>
    <div class = "KeywordsApplication">
        <p id = "keyword" v-for="keyWords in hireInfoJson.keyWords" :key="keyWords.id">
            #{{keyWords.keyWord}}
        </p>
    </div>
</template>
<script>
import hireInfoJsonData from '../assets/hireInfo.json'
export default {
    data() {
        return {
            hireInfoJson: hireInfoJsonData
        };
    }
}
</script>
<style>
#keyword{
    float: left;
    margin-left: 10%;
    font-weight: 600;
}
.KeywordsApplication{
    margin-bottom: 7%;
    margin-top: 2%;
}
</style>