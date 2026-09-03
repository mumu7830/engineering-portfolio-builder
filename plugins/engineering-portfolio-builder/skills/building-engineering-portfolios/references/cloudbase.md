# Tencent CloudBase deployment

Read this reference only after the user selects a validated local preview.

## Preconditions

- The static package contains only the selected site build and approved public assets.
- Data validation, privacy scanning, local link checks, and responsive preview checks pass.
- A disclosure lists every personal field and file that will become public.
- The user gives fresh action-time confirmation immediately before upload.

## Semi-automatic console flow

1. Use the user's existing signed-in Tencent Cloud console session. Do not ask for, copy, log, or store passwords, API keys, secret IDs, secret keys, cookies, or redemption codes.
2. Open the chosen CloudBase environment and its static website hosting upload flow.
3. If the console asks to create or change an environment, select a paid package, enable automatic renewal, accept a chargeable add-on, or supply credentials, stop and request explicit authorization. Deployment consent is not payment consent.
4. Upload the generated static package only after reconfirming the disclosed public fields.
5. Wait for deployment completion, then open the public HTTPS URL outside the management console and check the homepage, project anchors, images, mobile layout, contact links, and refresh behavior.
6. Generate a QR code from the verified HTTPS URL. Decode the produced image and require byte-for-byte URL equality before delivery.

## Failure handling

- A console error or expired session permits diagnosis, not credential collection.
- A failed upload may be retried only when it does not change price, renewal, environment ownership, or the disclosed public data.
- Never commit the generated private package, CloudBase configuration containing identifiers, or source documents to the public plugin repository.

