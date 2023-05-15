<template>
    <div id="container">
        <btn-base @click="getExcelSheet" label="Download Excel Sheet" icon="save"/>
    </div>
</template>

<script>
import BtnBase from '../components/generic/form/buttons/BtnSave.vue';

export default {
    name: 'UserActivity',
    components: { BtnBase },
    data: () => ({
        projectId: import.meta.env.VITE_PROJECT_ID,
    }),
    methods: {
        async getExcelSheet(){
            try {
                fetch(`http://${  this.projectId  }/download-excel`)
            } catch(e){
                console.log(e);
            } 

        }
    }
}
</script>

<style scoped>
    #container{
        text-align: center;
        padding-top: 10em;
    }
</style>