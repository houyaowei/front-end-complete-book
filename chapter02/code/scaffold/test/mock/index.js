const express = require('express')
const { graphql, buildSchema } = require('graphql')
const graphqlHTTP = require('express-graphql')
const cors = require('cors');

const app = express()
app.use(cors())

const schema = buildSchema(`
  type Query {
    language: String,
		result(a: Int,b:Int): Int
  },
`)

const rootValue = {
  language: () => 'GraphQL',
	result: ({a,b}) => {
		console.log("mock ,a:",a,",b:",b);
		return a + b;
	}
}

app.use('/graphql', graphqlHTTP({
  rootValue, schema, graphiql: true
}))
app.listen(4000, () => console.log('Listening on 4000'))
