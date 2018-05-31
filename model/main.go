package model

type Account struct {
	ID            string  `json:"id"`
	Balance       int     `json:"balance"`
	Seqnum        int     `json:"seqnum"`
	Numsubentries int     `json:"numsubentries"`
	Inflationdest *string `json:"inflationdest"`
	Homedomain    *string `json:"homedomain"`
	Thresholds    *string `json:"thresholds"`
	Flags         int     `json:"flags"`
	Lastmodified  int     `json:"lastmodified"`
}
type Trustline struct {
	Assettype    int    `json:"assettype"`
	Issuer       string `json:"issuer"`
	Assetcode    string `json:"assetcode"`
	Tlimit       int    `json:"tlimit"`
	Balance      int    `json:"balance"`
	Flags        int    `json:"flags"`
	Lastmodified int    `json:"lastmodified"`
}