-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('TL', 'EMPLOYEE');

-- AlterTable
ALTER TABLE "ProjectMember" ADD COLUMN     "role" "ProjectRole" NOT NULL DEFAULT 'EMPLOYEE';
