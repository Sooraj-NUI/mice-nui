import bcrypt from "bcrypt";

async function main() {
  const password = "Password123";

  const passwordHash = await bcrypt.hash(password, 10);

  const isCorrect = await bcrypt.compare(
    "Password123",
    passwordHash
  );

  const isWrong = await bcrypt.compare(
    "WrongPassword",
    passwordHash
  );

  console.log(isCorrect);
  console.log(isWrong);
}

main().catch(console.error);