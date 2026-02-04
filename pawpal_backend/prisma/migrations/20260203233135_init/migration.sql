-- CreateTable
CREATE TABLE "Pet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "weight" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "activityLevel" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "HealthMetric" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "petId" INTEGER NOT NULL,
    "lastVaccinationDate" TEXT,
    "nextVaccinationDate" TEXT,
    CONSTRAINT "HealthMetric_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeightEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "healthMetricId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    CONSTRAINT "WeightEntry_healthMetricId_fkey" FOREIGN KEY ("healthMetricId") REFERENCES "HealthMetric" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "petId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "MedicalRecord_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "HealthMetric_petId_key" ON "HealthMetric"("petId");
