# Security Spec

## Data Invariants
1. An \`order\` must have an \`ownerId\` that belongs to the user.
2. Only signed-in verified users can create an order.
3. Once an order's status reaches a terminal state (\`completed\` or \`cancelled\`), it cannot be updated.
4. An order's items array must strictly be bounded (max 20 items) and conform to item schema.
5. Users can only read their own orders. Admins can read all orders.
6. The app has an admin feature based on an \`admins\` collection. 
7. System-generated fields like \`createdAt\` must remain immutable after creation.

## The Dirty Dozen Payloads
1. **Identity Spoofing**: \`{ ownerId: "other_user_id" }\` -> Should be rejected.
2. **Missing required**: \`{ status: "pending" }\` without \`items\` -> Should be rejected.
3. **Invalid Status Transition**: Update status to \`completed\` immediately -> Denied by tiered update.
4. **Denial of Wallet**: Array with 1000 items -> Should be rejected due to size limits.
5. **String Overflow**: \`customerName\` is 2000 chars -> Should be rejected.
6. **Poisonous Path**: Invalid document ID via path variables -> Blocked by \`isValidId()\`
7. **Type Mismatch**: \`totalAmount\` as a string instead of number -> Blocked.
8. **Invalid Keys**: Payload contains \`fakeAdminField: true\` -> Blocked by \`hasOnly\`.
9. **Mutation of Immutable fields**: Trying to change \`createdAt\` -> Blocked.
10. **Spoofed Email Attack**: payload from non-verified email -> Blocked.
11. **Terminal State Bypass**: update an order that is \`completed\` -> Blocked.
12. **Blanket Read Attack**: Unauthenticated user trying to read orders -> Blocked.
