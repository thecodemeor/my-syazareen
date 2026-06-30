# Dependency Conflict: mozek-angular and @angular/common

When attempting to update the dependencies to their latest stable versions, a peer dependency conflict was encountered.

The latest version of `mozek-angular` (1.0.9) has strict peer dependencies requiring:
- `@angular/common`: `>=18.0.0 <21.0.0`
- `@angular/core`: `>=18.0.0 <21.0.0`

The project is currently using Angular 21.2.9. This creates an `ERESOLVE` error during `npm install`.

We cannot automatically fix this without either downgrading the Angular core version of this repository (which violates keeping core library up-to-date) or waiting for an update to `mozek-angular` that supports Angular 21.

Build and tests on the current dependencies remain stable.
