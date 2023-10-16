import { Response } from "express";
import Joi, { isError } from "joi";
import { log } from "winston";
import { getAccountById } from "../../modules/account";
import { Request } from "./../../request";
import { get as _get } from "lodash";
import { getPopInterNotesByAccountId, InternalNotes, saveInternalNotes } from "../../modules/internalNotes";


export default class Controller {

    protected readonly createInternalNotesSchema = Joi.object().keys({
        accountId: Joi.string().required()
            .external(async (value: string) => {
                if (!value) return value;
                const account = await getAccountById(value)
                if (!account) {
                    throw new Error("Account not Found!")
                }
            }),
        createdBy: Joi.string().required()
            .external(async (value: string) => {
                if (!value) return value;
                const account = await getAccountById(value)
                if (!account) {
                    throw new Error("Account not Found!")
                }
            }),

        notes: Joi.string().required()
    })

    protected readonly create = async (req: Request, res: Response) => {
        try {
            const payload = req.body
            const payloadValue = await this.createInternalNotesSchema
                .validateAsync(payload)
                .then((value) => {
                    return value;
                })
                .catch((e) => {
                    console.log(e);
                    if (isError(e)) {
                        res.status(422).json(e);
                        return;
                    } else {
                        res.status(422).json({ message: e.message });
                        return;
                    }
                });
            if (!payloadValue) {
                return;
            }

            if (
                !payloadValue.createdBy ||
                !req.authUser.accounts.find((ac) => ac.toString() === payloadValue.createdBy)
            ) {
                res.status(403).json({ message: "Unauthorized request." });
                return;
            }
            const newInternalNotes = new InternalNotes({
                ...payloadValue,
                updatedBy: payloadValue.createdBy
            })
            await saveInternalNotes(newInternalNotes)
            res.status(200).json(newInternalNotes)
        } catch (error) {
            log("error", "error in create internal notes", error);

            res.status(500).json({
                message: "Hmm... Something went wrong. Please try again later.",
                error: _get(error, "message"),
            });
        }
    }

    protected readonly get = async (req: Request, res: Response) => {
        try {
            const accountId = req.params.accountId

            const account = await getAccountById(accountId)
            if (!account) {
                res.status(422).json({ message: "Account not Found!" })
                return
            }
            const internalNotes = await getPopInterNotesByAccountId(accountId)
            res.status(200).json(internalNotes)
        } catch (error) {
            log("error", "error in get internal notes", error);

            res.status(500).json({
                message: "Hmm... Something went wrong. Please try again later.",
                error: _get(error, "message"),
            });
        }
    }
}