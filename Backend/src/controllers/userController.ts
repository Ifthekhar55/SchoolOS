import { Request, Response } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';

export class UserController {
  async getUsers(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { page = 1, limit = 10, role, isActive, search } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = { schoolId };

      if (role) {
        where.role = role;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      if (search) {
        where.OR = [
          { name: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } },
          { phone: { contains: String(search) } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            school: {
              select: { name: true },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        users: users.map(user => ({
          ...user,
          password: undefined,
          refreshToken: undefined,
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error('Get users error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
      });
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const user = await prisma.user.findFirst({
        where: {
          id,
          schoolId,
        },
        include: {
          school: {
            select: { name: true },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        user: {
          ...user,
          password: undefined,
          refreshToken: undefined,
        },
      });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
      });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const {
        name,
        nameBangla,
        email,
        phone,
        role,
        password,
        address,
        dateOfBirth,
        gender,
        bloodGroup,
        department,
        designation,
        emergencyContact,
      } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'School is required',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          nameBangla,
          email,
          phone,
          password: hashedPassword,
          role,
          school: {
            connect: { id: schoolId },
          },
          address,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender,
          bloodGroup,
          department,
          designation,
          emergencyContact,
          createdBy: req.user?.userId,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          ...user,
          password: undefined,
          refreshToken: undefined,
        },
      });
    } catch (error) {
      console.error('Create user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user',
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const {
        name,
        nameBangla,
        phone,
        role,
        address,
        dateOfBirth,
        gender,
        bloodGroup,
        department,
        designation,
        emergencyContact,
        isActive,
      } = req.body;

      const user = await prisma.user.findFirst({
        where: { id, schoolId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          name,
          nameBangla,
          phone,
          role,
          address,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender,
          bloodGroup,
          department,
          designation,
          emergencyContact,
          isActive,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user: {
          ...updatedUser,
          password: undefined,
          refreshToken: undefined,
        },
      });
    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update user',
      });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const user = await prisma.user.findFirst({
        where: { id, schoolId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      await prisma.user.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user',
      });
    }
  }

  async activateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const user = await prisma.user.findFirst({
        where: { id, schoolId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isActive: true },
      });

      return res.status(200).json({
        success: true,
        message: 'User activated successfully',
        user: {
          ...updatedUser,
          password: undefined,
          refreshToken: undefined,
        },
      });
    } catch (error) {
      console.error('Activate user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to activate user',
      });
    }
  }

  async deactivateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const user = await prisma.user.findFirst({
        where: { id, schoolId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      return res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
        user: {
          ...updatedUser,
          password: undefined,
          refreshToken: undefined,
        },
      });
    } catch (error) {
      console.error('Deactivate user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to deactivate user',
      });
    }
  }

  async assignRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const { roleId } = req.body;

      const user = await prisma.user.findFirst({
        where: { id, schoolId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role: roleId },
      });

      return res.status(200).json({
        success: true,
        message: 'Role assigned successfully',
        user: {
          ...updatedUser,
          password: undefined,
          refreshToken: undefined,
        },
      });
    } catch (error) {
      console.error('Assign role error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to assign role',
      });
    }
  }
}

export default new UserController();