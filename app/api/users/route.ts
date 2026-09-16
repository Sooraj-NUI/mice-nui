import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const email = url.searchParams.get("email");
  const name = url.searchParams.get("name");

  try {
    // Both email and name were provided
    if (email !== null && name !== null) {
      if (!email.trim() || !name.trim()) {
        return NextResponse.json(
          { error: "Email and name cannot be empty" },
          { status: 400 },
        );
      }

      const users = await prisma.user.findMany({
        where: {
          email: email.trim(),
          name: name.trim(),
        },
      });

      return NextResponse.json(users);
    }

    // Only email was provided
    if (email !== null) {
      if (!email.trim()) {
        return NextResponse.json(
          { error: "Email cannot be empty" },
          { status: 400 },
        );
      }

      const user = await prisma.user.findUnique({
        where: {
          email: email.trim(),
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user);
    }

    // Only name was provided
    if (name !== null) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 },
        );
      }

      const users = await prisma.user.findMany({
        where: {
          name: name.trim(),
        },
      });

      return NextResponse.json(users);
    }

    // No filters were provided
    const users = await prisma.user.findMany();

    return NextResponse.json(users);
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
  const email = url.searchParams.get("email");

  if (email === null) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!email.trim()) {
    return NextResponse.json(
      { error: "Email cannot be empty" },
      { status: 400 },
    );
  }

  try {
    const userDetails = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (!userDetails) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const deletedUser = await prisma.user.delete({
      where: {
        email: email.trim(),
      },
    });

    return NextResponse.json(deletedUser);
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
  const email = url.searchParams.get("email");

  if (email === null) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!email.trim()) {
    return NextResponse.json(
      { error: "Email cannot be empty" },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const newEmail = typeof body.email === "string" ? body.email.trim() : "";

    let data;

    if (name && newEmail) {
      data = {
        name,
        email: newEmail,
      };
    } else if (name) {
      data = {
        name,
      };
    } else if (newEmail) {
      data = {
        email: newEmail,
      };
    } else {
      return NextResponse.json(
        { error: "Either name or email is required" },
        { status: 400 },
      );
    }

    const userToBeUpdated = await prisma.user.update({
      where: {
        email: email.trim(),
      },
      data,
    });

    return NextResponse.json({
      userToBeUpdated,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
