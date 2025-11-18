import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Definição da Interface TypeScript
export enum UserRole {
    Admin = 'Admin',
    Inventory = 'Inventory',
    Sales = 'Sales',
}

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    comparePassword(candidatePassword: string): Promise<boolean>; // Método de instância
}

// Definição do Schema Mongoose
const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, requered: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }, // 'select: false' omite a senha em consultas
    role: { type: String, enum: Object.values(UserRole), default: UserRole.Inventory },
}, { timestamps: true });

// Hook Avançado: Hash de senha ANTES de salvar
// Executa esta função antes de salvar o documento (pré-save)
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) { // Só aplica o hash se a senha foi modificada (ou é nova)
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err: any) {
        next(err);
    }
});

// Método de instância: Comparar Senha
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {

    // Acessa o hash da senha, mesmo com 'select: false'
    const user = this as IUser;
    return bcrypt.compare(candidatePassword, user.password);
};

export default model<IUser>('User', UserSchema);
