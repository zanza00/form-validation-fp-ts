import { pipe } from "fp-ts/lib/pipeable";
import { array } from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as NEA from "fp-ts/es6/NonEmptyArray";

type SingleError = { field: string; error: string };

const applicativeValidation = E.getValidation(NEA.getSemigroup<SingleError>());

function lift<A>(
  check: (a: A) => E.Either<SingleError, A>
): (a: A) => E.Either<NEA.NonEmptyArray<SingleError>, A> {
  return a =>
    pipe(
      check(a),
      E.mapLeft(a => [a])
    );
}

export function validateErrorMap<D extends object, E extends SingleError>(
  rules: Array<(data: D) => E.Either<E, D>>
): (data: D) => E.Either<Record<string, string[]>, D> {
  return data =>
    pipe(
      array.sequence(applicativeValidation)(
        rules.map(valid => lift(valid)(data))
      ),
      E.bimap(
        errs => collectErrors(errs),
        goodData => {
          console.log(goodData);
          return data;
        }
      )
    );
}

export function collectErrors(
  err: NEA.NonEmptyArray<{ field: string; error: string }>
): Record<string, string[]> {
  return err.reduce(
    (prev, current) => {
      const currError = prev[current.field];
      // console.log("currError", { currError, prev, current });
      return {
        ...prev,
        [current.field]: [...currError, current.error]
      };
    },
    {
      email: [],
      password1: [],
      password2: []
    } as Record<string, string[]>
  );
}
