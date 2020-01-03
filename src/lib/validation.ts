import { pipe } from "fp-ts/lib/pipeable";
import { array } from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as NEA from "fp-ts/es6/NonEmptyArray";

const applicativeValidation = E.getValidation(NEA.getSemigroup<object>());

function lift<E, A>(
  check: (a: A) => E.Either<E, A>
): (a: A) => E.Either<NEA.NonEmptyArray<E>, A> {
  return a =>
    pipe(
      check(a),
      E.mapLeft(a => [a])
    );
}

export function validateErrorMap<D extends object, E extends object>(
  rules: Array<(data: D) => E.Either<E, D>>
): (data: D) => E.Either<Record<string, string[]>, D> {
  return data =>
    pipe(
      array.sequence(applicativeValidation)(
        rules.map(valid => lift(valid)(data))
      ),
      E.map(() => {
        console.log(data);
        return data;
      }),
      E.mapLeft(errs => collectErrors(errs))
    );
}

export function collectErrors(
  err: NEA.NonEmptyArray<{ field: string; error: string }>
): Record<string, string[]> {
  return err.reduce(
    (prev, current) => {
      const currError = prev[current.field];
      if (currError !== undefined) {
        return {
          ...prev,
          [current.field]: [...currError, current.error]
        };
      }
      return {
        ...prev,
        [current.field]: [current.error]
      };
    },
    {} as Record<string, string[]>
  );
}
