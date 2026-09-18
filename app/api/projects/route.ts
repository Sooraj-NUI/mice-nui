import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    if (body.name === undefined || body.name === null) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (typeof body.name !== "string") {
      return NextResponse.json(
        { error: "Name must be a string" },
        { status: 400 },
      );
    }

    const name = body.name.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 },
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const idParam = url.searchParams.get("id");
  const name = url.searchParams.get("name");

  try {
    // Both id and name were provided
    if (idParam !== null && name !== null) {
      if (!idParam.trim() || !name.trim()) {
        return NextResponse.json(
          { error: "ID and name cannot be empty" },
          { status: 400 },
        );
      }

      const id = Number(idParam);
      if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        return NextResponse.json(
          { error: "Invalid project ID" },
          { status: 400 },
        );
      }

      const projects = await prisma.project.findMany({
        where: {
          id,
          name: name.trim(),
        },
      });

      return NextResponse.json(projects);
    }

    // Only id was provided
    if (idParam !== null) {
      if (!idParam.trim()) {
        return NextResponse.json(
          { error: "ID cannot be empty" },
          { status: 400 },
        );
      }

      const id = Number(idParam);
      if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        return NextResponse.json(
          { error: "Invalid project ID" },
          { status: 400 },
        );
      }

      const project = await prisma.project.findUnique({
        where: {
          id,
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(project);
    }

    // Only name was provided
    if (name !== null) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 },
        );
      }

      const projects = await prisma.project.findMany({
        where: {
          name: name.trim(),
        },
      });

      return NextResponse.json(projects);
    }

    // No filters were provided
    const projects = await prisma.project.findMany();

    return NextResponse.json(projects);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  let idParam = url.searchParams.get("id");

  if (idParam === null) {
    try {
      const body = await request.clone().json();
      if (body && typeof body === "object" && body.id !== undefined && body.id !== null) {
        idParam = String(body.id);
      }
    } catch {
      // Ignore if request has no JSON body
    }
  }

  if (idParam === null) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  if (!idParam.trim()) {
    return NextResponse.json(
      { error: "ID cannot be empty" },
      { status: 400 },
    );
  }

  const id = Number(idParam);
  if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { error: "Invalid project ID" },
      { status: 400 },
    );
  }

  try {
    const projectDetails = await prisma.project.findUnique({
      where: { id },
    });

    if (!projectDetails) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const deletedProject = await prisma.project.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(deletedProject);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const url = new URL(request.url);
  let idParam = url.searchParams.get("id");

  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    if (idParam === null && body.id !== undefined && body.id !== null) {
      idParam = String(body.id);
    }

    if (idParam === null) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (!idParam.trim()) {
      return NextResponse.json(
        { error: "ID cannot be empty" },
        { status: 400 },
      );
    }

    const id = Number(idParam);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 },
      );
    }

    if (body.name === undefined || body.name === null) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 },
      );
    }

    if (typeof body.name !== "string") {
      return NextResponse.json(
        { error: "Name must be a string" },
        { status: 400 },
      );
    }

    const name = body.name.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 },
      );
    }

    const projectDetails = await prisma.project.findUnique({
      where: { id },
    });

    if (!projectDetails) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectToBeUpdated = await prisma.project.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });

    return NextResponse.json({
      projectToBeUpdated,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
