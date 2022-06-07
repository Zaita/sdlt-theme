import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import InfoFilledIcon from '@material-ui/icons/Info';
import Tooltip from '@material-ui/core/Tooltip';
import Fade from '@material-ui/core/Fade';
import { ClickAwayListener } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  arrow: {
    color: '#2371A6',
  },
  tooltip: {
    backgroundColor: '#2371A6',
    width: '210px',
    padding: '8px 10px',
    fontSize: '10px',
    lineHeight: '14px',
    fontWeight: 400,
    borderRadius: '2px',
    marginLeft: '1px',
    marginTop: '5px',
  },
}));

function TooltipStyled(props) {
  const classes = useStyles();
  return <Tooltip classes={classes} {...props} />;
}

function InformationTooltip({ content }) {
  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <div className="information-tooltip-container">
        <TooltipStyled
          PopperProps={{
            disablePortal: true,
          }}
          open={open}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          title={content}
          placement="bottom"
          TransitionComponent={Fade} TransitionProps={{ timeout: 0 }}
          arrow
        >
          {open ? (
            <InfoFilledIcon className="column-info" onClick={handleTooltipOpen} />
          ) :
            (
              <InfoOutlinedIcon className="column-info" onClick={handleTooltipOpen} />
            )}
        </TooltipStyled>
      </div>
    </ClickAwayListener>
  );
}

export default InformationTooltip;
