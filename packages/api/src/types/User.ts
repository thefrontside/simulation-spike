import { extendType, objectType, stringArg } from 'nexus';
// import { GraphQLDateTime } from 'graphql-iso-date';

export const User = objectType({
  name: 'User',
  nonNullDefaults: {
    output: true,
  },
  definition(t) {
    t.id('id');
    t.string('email');
    t.string('firstName');
    t.string('lastName');
    t.string('phone');
    // t.field('createdAt', {
    //   type: GraphQLDateTime,
    // });
    // t.field('updatedAt', `{
    //   type: GraphQLDateTime,
    // });
  },
});

export const QueryUser = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('users', {
      type: 'User',
      resolve(_, __, ctx) {
        return ctx.db.data.users;
      },
    });
  },
});

export const MutationUser = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('registerUser', {
      type: 'User',
      args: {
        email: stringArg(),
        firstName: stringArg(),
        lastName: stringArg(),
        phone: stringArg(),
        // createdAt: arg({
        //   type: GraphQLDateTime,
        // }),
        // updatedAt: arg({
        //   type: GraphQLDateTime,
        // }),
      },
      resolve(_, args, ctx) {
        return ctx.db.createUser(args);
      },
    });
  },
});
