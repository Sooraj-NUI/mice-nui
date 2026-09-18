import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const taskId = Number(id);

    if (isNaN(taskId) || !Number.isInteger(taskId) || taskId <= 0) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        user: true,
        project: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const taskId = Number(id);

    if (isNaN(taskId) || !Number.isInteger(taskId) || taskId <= 0) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const deletedTask = await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json(deletedTask);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const taskId = Number(id);

    if (isNaN(taskId) || !Number.isInteger(taskId) || taskId <= 0) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    if (body.status === undefined || body.status === null) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    if (typeof body.status !== "string") {
      return NextResponse.json(
        { error: "Status must be a string" },
        { status: 400 },
      );
    }

    const status = body.status.trim().toUpperCase();

    if (status !== "PENDING" && status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Status must be PENDING or COMPLETED" },
        { status: 400 },
      );
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: status as "PENDING" | "COMPLETED" },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}