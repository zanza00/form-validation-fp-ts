import * as React from "react";
import { validateErrorMap } from "./lib/validation";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";

export default function Form() {
  const initialState = {
    email: "",
    password1: "",
    password2: ""
  };
  const initialErrors: {
    email: string[];
    password1: string[];
    password2: string[];
  } = {
    email: [],
    password1: [],
    password2: []
  };

  const [formState, setFormState] = React.useState(initialState);
  const [errorMap, setErrorMap] = React.useState(initialErrors);
  const [validData, setValidData] = React.useState<Record<string, string>>({});
  const [debug, setDebug] = React.useState({ form: {}, errors: {} });

  type FormData = typeof initialState;

  type ValidationError<D extends object> = { field: keyof D; error: string };

  // email rules
  const validEmail = (
    data: FormData
  ): E.Either<ValidationError<FormData>, FormData> =>
    /@/g.test(data.email)
      ? E.right(data)
      : E.left({ field: "email", error: "email must contain '@'" });

  const validDomain = (
    data: FormData
  ): E.Either<ValidationError<FormData>, FormData> =>
    data.email.includes("@example.com")
      ? E.right(data)
      : E.left({
          field: "email",
          error: "invalid domain, only valid is '@example.com'"
        });

  //password rules
  const minLength = (
    data: FormData
  ): E.Either<ValidationError<FormData>, FormData> =>
    data.password1.length >= 6
      ? E.right(data)
      : E.left({ field: "password1", error: "at least 6 characters" });

  const oneCapital = (
    data: FormData
  ): E.Either<ValidationError<FormData>, FormData> =>
    /[A-Z]/g.test(data.password1)
      ? E.right(data)
      : E.left({ field: "password1", error: "at least one capital letter" });

  const oneNumber = (
    data: FormData
  ): E.Either<ValidationError<FormData>, FormData> =>
    /[0-9]/g.test(data.password1)
      ? E.right(data)
      : E.left({ field: "password1", error: "at least one number" });

  const samePassword = (
    data: FormData
  ): E.Either<ValidationError<FormData>, FormData> =>
    data.password1 === data.password2
      ? E.right(data)
      : E.left({ field: "password2", error: "password is not the same" });

  const errorAccumulator = validateErrorMap([
    validEmail,
    validDomain,
    minLength,
    oneCapital,
    oneNumber,
    samePassword
  ]);

  function validateAndSend(form: FormData) {
    setDebug({ form, errors: errorAccumulator(form) });

    pipe(
      errorAccumulator(form),
      E.fold(
        e => {
          setErrorMap(e);
        },
        fd => {
          setValidData(fd);
          setErrorMap(initialErrors);
        }
      )
    );
  }

  return (
    <div>
      <div>
        Email:{" "}
        <input
          value={formState.email}
          onChange={e => {
            const newFormState = { ...formState, email: e.target.value };
            setFormState(newFormState);
          }}
        />
        <ul>
          {errorMap.email.map(x => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
      <div>
        Password:{" "}
        <input
          value={formState.password1}
          onChange={e => {
            const newFormState = { ...formState, password1: e.target.value };
            setFormState(newFormState);
          }}
        />
        <ul>
          {errorMap.password1.map(x => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
      <div>
        Password 2:{" "}
        <input
          value={formState.password2}
          onChange={e => {
            const newFormState = { ...formState, password2: e.target.value };
            setFormState(newFormState);
          }}
        />
        <ul>
          {errorMap.password2.map(x => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>

      <button onClick={() => validateAndSend(formState)}>Submit</button>
      <div>
        <ul>
          {Object.values(validData).map((key, value) => {
            return (
              <li key={key}>
                `${key} -> ${value}`
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        debug info: <br />
        form:
        <code>{JSON.stringify(debug.form, null, 2)}</code>
        <br />
        errors:
        <code>{JSON.stringify(debug.errors, null, 2)}</code>
      </div>
    </div>
  );
}
