export enum LinkDecoratorEnum {
  HSFP = "__hsfp",
  HSSC = "__hssc",
  HSTC = "__hstc",
  S = "__s",
  HSENC = "_hsenc",
  OPENSTAT = "_openstat",
  DCLID = "dclid",
  FBCLID = "fbclid",
  GCLID = "gclid",
  HS_CTA_TRACKING = "hsCtaTracking",
  MC_EID = "mc_eid",
  MKT_TOK = "mkt_tok",
  ML_SUBSCRIBER = "ml_subscriber",
  ML_SUBSCRIBER_HASH = "ml_subscriber_hash",
  MSCLKID = "msclkid",
  OLY_ANON_ID = "oly_anon_id",
  OLY_ENC_ID = "oly_enc_id",
  RB_CLICKID = "rb_clickid",
  S_CID = "s_cid",
  VERO_CONV = "vero_conv",
  VERO_ID = "vero_id",
  WICKEDID = "wickedid",
  YCLID = "yclid",
}
export type LinkDecoratorType = `${LinkDecoratorEnum}`;
export const LINK_DECORATORS: LinkDecoratorType[] =
  Object.values(LinkDecoratorEnum);
