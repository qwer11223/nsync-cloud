<template>
  <div class="no-file">
			<img src="@/../public/pic_sharing_empty.png" alt />
			<p>暂无文件</p>
		</div>
</template>

<script>
export default {
    name:'Nofile',
    //props:['imgSrc']
}
</script>

<style lang="scss" scoped>
.no-file{
    img{
        display: block;
        margin: 0 auto;
        margin-top: 30px;
    }
    p{
        margin: 20px 0;
        font-size: 18px;
        color: #107ffc;
        text-align: center;
    }
}

</style>