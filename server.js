const express = require('express');
const expressGraphQL = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLID
} = require('graphql')

const authors = [
    { id: 1, name: 'J. K. Rowling' },
    { id: 2, name: 'J. R. R. Tolkien' },
    { id: 3, name: 'Brent Weeks' }
]

const books = [
    { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
    { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
    { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
    { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
    { id: 5, name: 'The Two Towers', authorId: 2 },
    { id: 6, name: 'The Return of the King', authorId: 2 },
    { id: 7, name: 'The Way of Shadows', authorId: 3 },
    { id: 8, name: 'Beyond the Shadows', authorId: 3 }
]
const AuthorType = new GraphQLObjectType({
    name: 'author',
    description: 'death of the author',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => books.filter((b) => b.authorId === author.id)
        }
    })
})

const BookType = new GraphQLObjectType({
    name: 'book',
    description: 'take a look, it\'s in a book',
    fields: () => ({
        //pulled directly from object, so no need for resolve
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLString)},
        author: {type: AuthorType, resolve: (book) => authors.find((a) => a.id === book.authorId)}
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'mutation',
    description: 'root of the mutations',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'add a new book',

            args: {
                name: {
                    type: GraphQLNonNull(GraphQLString),
                },
                authorId: {
                    type: GraphQLNonNull(GraphQLInt),
                },
            },
            resolve: (parent, args) => {
                console.log(parent, 'parent');
                const newBook = {id: books.length + 1, name: args.name, authorId: args.authorID}
                books.push(newBook);
                return newBook;
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'add a new author',

            args: {
                name: {
                    type: GraphQLNonNull(GraphQLString),
                },
            },
            resolve: (parent, args) => {
                console.log(parent, 'parent');
                const newAuthor = {id: authors.length + 1, name: args.name}
                authors.push(newAuthor);
                return newAuthor;
            }
        }
    }),
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'single book',
            args: {
                id: {type: GraphQLInt}
            },
            //query db here
            resolve: (parent, args) => books.find((b) => b.id === args.id)
        },
        author: {
            type: AuthorType,
            description: 'single author',
            args: {
                id: {type: GraphQLInt}
            },
            //query db here
            resolve: (parent, args) => authors.find((a) => a.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of books',
            //query db here
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of All Authors',
            resolve: () => authors
        },
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType,
})

const app = express()
app.use('/graphql', expressGraphQL.graphqlHTTP({
    schema: schema,
    graphiql: true,
}))
app.listen(3000, () => console.log('server started'))