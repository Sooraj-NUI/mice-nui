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

    if (body.title === undefined || body.title === null) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (typeof body.title !== "string") {
      return NextResponse.json(
        { error: "Title must be a string" },
        { status: 400 },
      );
    }

    const title = body.title.trim();

    if (!title) {
      return NextResponse.json(
        { error: "Title cannot be empty" },
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

    let dueDate: Date | undefined;

    if (body.dueDate !== undefined && body.dueDate !== null) {
      if (typeof body.dueDate !== "string") {
        return NextResponse.json(
          { error: "Due date must be a string" },
          { status: 400 },
        );
      }

      dueDate = new Date(body.dueDate);

      if (isNaN(dueDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid due date" },
          { status: 400 },
        );
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        userId,
        projectId,
        dueDate,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Project or user not found" },
          { status: 404 },
        );
      }
    }

    console.error(error);

    return NextResponse.json(
      { error: "Failed to create task" },
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

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        user: true,
        project: true,
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch project tasks" },
      { status: 500 },
    );
  }
}