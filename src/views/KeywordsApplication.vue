<template>
    <v-row class = "KeywordsApplication">
        <p id = "keyword" v-for="keyWords in hireInfoJson.keyWords" :key="keyWords.id">
            #{{keyWords.keyWord}}
        </p>
    </v-row>
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
    text-align: center;
    margin-bottom: 2%;
    margin-top: 2%;
}
</style>