// src/schema/movie.js
import { makeExecutableSchema } from 'graphql-tools';
import http from 'request-promise-json';

const MOVIE_DB_API_KEY = process.env.MOVIE_DB_API_KEY;

export const typeDefs = `
  type Movie {
    id: Int!
    original_language: String
    overview: String
    title: String!
    vote_average: Float
    release_date: String
  }

  type Person {
    name: String
    popularity: Float
    movies: [Movie]
  }

  type Query {
    movies(search: String): [Movie]
    movie(id: ID, imdb_id: String): Movie
  }

  type Mutation {
    rateMovie (
      id: Int!
    ): Movie
  }
`;
debugger;
const resolvers = {
  Query: {
    movie: async (obj, args, context, info) => {
      if (args.id) {
        return http
          .get(`https://api.themoviedb.org/3/movie/${args.id}?api_key=${MOVIE_DB_API_KEY}&language=en-US`)
      }
      if (args.imdb_id) {
        const results = await http
          .get(`https://api.themoviedb.org/3/find/${args.imdb_id}?api_key=${MOVIE_DB_API_KEY}&language=en-US&external_source=imdb_id`)

        if (results.movie_results.length > 0) {
          const movieId = results.movie_results[0].id
          return http
            .get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${MOVIE_DB_API_KEY}&language=en-US`)
        }
      }
    },
    movies: async (obj, args, context, info) => {
      if (args.search) {
        const { results } = await http
          .get(`https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_DB_API_KEY}&language=en-US&query=${args.search}&page=1`)
        return results
      }
    },
  },
  Mutation: {
    rateMovie: async (obj, args, context, info) => {
      const movie = await http
        .get(`https://api.themoviedb.org/3/movie/${args.id}?api_key=${MOVIE_DB_API_KEY}&language=en-US`)

      if (!movie) {
        throw new Error(`Couldn't find movie with id ${args.id}`);
      }

      return http
        .post(
          `https://api.themoviedb.org/3/movie/${args.id}/rating?api_key=${MOVIE_DB_API_KEY}&language=en-US`,
          { value: rating }
        )
    }
  },

};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;
