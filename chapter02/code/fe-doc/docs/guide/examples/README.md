## 嵌入 vue 组件

<Books />

```javascript
<template>
  <div id="app">
    <div v-for="book in books" :key="book.name">
      <span>书名：{{book.name}}</span>
      <span>作者：{{book.author}}</span>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'app',
    data () {
      return {
        books: [
          {
            name: "TypeScript编程",
            author: "Boris Cherny"
          },
          {
            name: "Go Web编程",
            author: "Sau Sheong Chang"
          }
        ]
      }
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
  }

</style>

```
