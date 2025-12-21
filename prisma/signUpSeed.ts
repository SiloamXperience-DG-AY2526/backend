/// <reference types="node" />

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


async function main() {
  // Create the form for partner signup
  // TODO: add all the fields after confirmation on frontend?
  const form = await prisma.form.create({
    data: {
      title: 'Partner Signup Form',
      slug: 'partner-signup',
      fields: {
        create: [
          {
            fieldTitle: 'Full Name',
            fieldAlias: 'name',
            fieldType: 'TEXT',
            sortOrder: 1, // Position in the form
          },
          {
            fieldTitle: 'NRIC',
            fieldAlias: 'nric',
            fieldType: 'TEXT',
            sortOrder: 2,
          },
          {
            fieldTitle: 'Passport Number',
            fieldAlias: 'passport_number',
            fieldType: 'TEXT',
            sortOrder: 3,
          },
          {
            fieldTitle: 'Email',
            fieldAlias: 'email',
            fieldType: 'TEXT',
            sortOrder: 4,
          },
          {
            fieldTitle: 'Contact Number',
            fieldAlias: 'contact_number',
            fieldType: 'TEXT',
            sortOrder: 5,
          },
          {
            fieldTitle: 'Password',
            fieldAlias: 'password',
            fieldType: 'TEXT',
            sortOrder: 6,
          },
        ],
      },
    },
  });
  console.log(`Form created: ${form.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
