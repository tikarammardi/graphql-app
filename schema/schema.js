const axios = require("axios");
const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLNonNull,
} = graphql;

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new graphql.GraphQLList(UserType),
      async resolve(parentValue, args) {
        const res = await axios.get(
          `http://127.0.0.1:3000/companies/${parentValue.id}/users`
        );

        return res.data;
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      async resolve(parentValue, args) {
        const res = await axios.get(
          `http://127.0.0.1:3000/companies/${parentValue.companyId}`
        );
        return res.data;
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      async resolve(parentValue, args) {
        const res = await axios.get(`http://127.0.0.1:3000/users/${args.id}`);
        return res.data;
      },
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      async resolve(parentValue, args) {
        const res = await axios.get(
          `http://127.0.0.1:3000/companies/${args.id}`
        );
        return res.data;
      },
    },
  },
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString },
      },
      async resolve(parentValue, args) {
        const res = await axios.post("http://127.0.0.1:3000/users", {
          ...args,
        });

        return res.data;
      },
    },
    deleteUser: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      async resolve(parentValue, args) {
        const { id } = args;
        const res = await axios.delete(`http://127.0.0.1:3000/users/${id}`);
        return res.data;
      },
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString },
      },

      async resolve(parentValue, args) {
        const { id, firstName, age, companyId } = args;
        const res = await axios.patch(`http://127.0.0.1:3000/users/${id}`, {
          firstName,
          age,
          companyId,
        });

        return res.data;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
