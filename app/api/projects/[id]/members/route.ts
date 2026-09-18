import { Prisma } from "@prisma/client";
import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const projectId = Number(id);
    if (isNaN(projectId) || !Number.isInteger(projectId) || projectId <= 0) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 },
      );
    }

    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    if (body.userId === undefined || body.userId === null) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const userId = Number(body.userId);
    if (isNaN(userId) || !Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Composite unique violation — member already exists
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "User is already a member of this project" },
          { status: 409 },
        );
      }
      // Foreign key constraint — project or user does not exist
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Project or user not found" },
          { status: 404 },
        );
      }
    }
    console.error(error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const projectId = Number(id);
    if (isNaN(projectId) || !Number.isInteger(projectId) || projectId <= 0) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 },
      );
    }

    const members = await prisma.projectMember.findMany({
      where: {
        projectId,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch project members" },
      { status: 500 },
    );
  }
}