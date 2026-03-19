-- AlterTable
ALTER TABLE "ChildProfile" ADD COLUMN     "coppaConsentGivenAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "privacyPolicyAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "tosAcceptedAt" TIMESTAMP(3);
